import { supabase } from "../lib/supabase"
import axios from "axios"

/**
 * Script para salvar um depósito existente no Supabase
 * Útil quando você já criou um depósito diretamente na XGate
 */
async function saveDepositToSupabase(depositId: string, userId = "user-123") {
  try {
    console.log("Verificando conexão com o Supabase...")
    const { data: testData, error: testError } = await supabase.from("transactions").select("*").limit(1)

    if (testError) {
      console.error("❌ Erro ao conectar com o Supabase:", testError.message)
      console.error("Verifique se as variáveis de ambiente estão configuradas corretamente.")
      return false
    }

    console.log("✅ Conexão com o Supabase estabelecida!")

    // Credenciais da XGate
    const XGATE_API_URL = "https://api.xgateglobal.com"
    const XGATE_EMAIL = "maurilioxgate@xgate.com.br"
    const XGATE_PASSWORD = "maurilioxgate@123"

    // Autenticar na XGate
    console.log("\nAutenticando na API XGate...")
    const loginResponse = await axios.post(`${XGATE_API_URL}/auth/token`, {
      email: XGATE_EMAIL,
      password: XGATE_PASSWORD,
    })

    const token = loginResponse.data.token || loginResponse.data.access_token
    console.log("✅ Autenticação bem-sucedida. Token obtido.")

    // Obter detalhes do depósito
    console.log(`\nObtendo detalhes do depósito ${depositId}...`)
    const depositResponse = await axios.get(`${XGATE_API_URL}/deposit/${depositId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const depositInfo = depositResponse.data.data
    console.log("✅ Detalhes do depósito obtidos com sucesso!")
    console.log("ID do depósito:", depositInfo.id)
    console.log("Status:", depositInfo.status)
    console.log("Cliente:", depositInfo.customerId)
    console.log("Valor:", depositInfo.amount)

    // Verificar se já existe um mapeamento para este cliente
    console.log("\nVerificando mapeamento de cliente...")
    const { data: existingMapping } = await supabase
      .from("xgate_customer_mapping")
      .select("*")
      .eq("customer_id", depositInfo.customerId)
      .single()

    // Se não existir, salvar o mapeamento
    if (!existingMapping) {
      console.log(`Salvando mapeamento: usuário ${userId} -> cliente XGate ${depositInfo.customerId}`)
      const { error: mappingError } = await supabase.from("xgate_customer_mapping").insert({
        user_id: userId,
        customer_id: depositInfo.customerId,
      })

      if (mappingError) {
        console.error("❌ Erro ao salvar mapeamento:", mappingError.message)
        return false
      }
      console.log("✅ Mapeamento salvo com sucesso!")
    } else {
      console.log("✅ Mapeamento já existe:", existingMapping)
    }

    // Verificar se a transação já existe
    console.log("\nVerificando se a transação já existe...")
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("reference", depositId)
      .single()

    if (existingTransaction) {
      console.log("✅ Transação já existe no Supabase:", existingTransaction)
      return true
    }

    // Registrar a transação no Supabase
    console.log("\nRegistrando transação no Supabase...")
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      amount: depositInfo.amount,
      status: depositInfo.status === "COMPLETED" || depositInfo.status === "CONFIRMED" ? "completed" : "pending",
      reference: depositId,
      details: depositInfo,
    })

    if (transactionError) {
      console.error("❌ Erro ao registrar transação:", transactionError.message)
      return false
    }

    console.log("✅ Transação registrada com sucesso!")
    return true
  } catch (error: any) {
    console.error("\n❌ Erro ao salvar depósito no Supabase:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else {
      console.error("Erro:", error.message)
    }

    return false
  }
}

// ID do depósito a ser salvo (use o ID do depósito que você criou)
const depositId = process.argv[2] || "67df383b3c3d74da151e86b1" // Use o ID do seu depósito aqui
const userId = process.argv[3] || "user-123" // Use o ID do usuário ou mantenha o padrão

// Executar o salvamento
console.log("=== SALVAMENTO DE DEPÓSITO NO SUPABASE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

saveDepositToSupabase(depositId, userId)
  .then((success) => {
    console.log("\n=== RESUMO ===")
    if (success) {
      console.log("✅ Depósito salvo no Supabase com sucesso!")
      console.log("\nPróximos passos:")
      console.log("1. Configure o webhook para receber notificações de mudança de status")
      console.log("2. Quando o pagamento for confirmado, o webhook atualizará o status da transação")
      console.log("3. O saldo do usuário será atualizado automaticamente")
    } else {
      console.log("❌ Falha ao salvar depósito no Supabase. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o salvamento:", err)
    console.error("===============================")
  })

