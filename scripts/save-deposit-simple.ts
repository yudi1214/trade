import { supabase } from "../lib/supabase"

/**
 * Script simplificado para salvar um depósito no Supabase
 * Não depende de obter detalhes do depósito da API
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

    // Verificar se já existe um mapeamento para este cliente
    const customerId = "67de2322bbf0316b4edca8df" // ID do cliente que você já tem

    console.log("\nVerificando mapeamento de cliente...")
    const { data: existingMapping } = await supabase
      .from("xgate_customer_mapping")
      .select("*")
      .eq("customer_id", customerId)
      .single()

    // Se não existir, salvar o mapeamento
    if (!existingMapping) {
      console.log(`Salvando mapeamento: usuário ${userId} -> cliente XGate ${customerId}`)
      const { error: mappingError } = await supabase.from("xgate_customer_mapping").insert({
        user_id: userId,
        customer_id: customerId,
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

    // Criar dados simulados do depósito
    const depositInfo = {
      id: depositId,
      customerId: customerId,
      amount: 100,
      currency: "BRL",
      code: "00020126840014br.gov.bcb.pix2562qrcode.transfeera.com/cob/a2c16050-5558-4874-8420-4546ca532b5c5204000053039865802BR5925CODE TECH ENTERPRISE LTDA6012SAO PAULO SP62070503***63041490",
      status: "WAITING_PAYMENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Registrar a transação no Supabase
    console.log("\nRegistrando transação no Supabase...")
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      amount: depositInfo.amount,
      status: "pending",
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
    console.error("Erro:", error.message)
    return false
  }
}

// ID do depósito a ser salvo (use o ID do depósito que você criou)
const depositId = process.argv[2] || "67df383b3c3d74da151e86b1" // Use o ID do seu depósito aqui
const userId = process.argv[3] || "user-123" // Use o ID do usuário ou mantenha o padrão

// Executar o salvamento
console.log("=== SALVAMENTO DE DEPÓSITO NO SUPABASE (SIMPLIFICADO) ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

saveDepositToSupabase(depositId, userId)
  .then((success) => {
    console.log("\n=== RESUMO ===")
    if (success) {
      console.log("✅ Depósito salvo no Supabase com sucesso!")
      console.log("\nPróximos passos:")
      console.log("1. Inicie o servidor Next.js para processar webhooks")
      console.log("2. Simule um webhook com o script simulate-webhook-simple.ts")
      console.log("3. Verifique se o status da transação foi atualizado")
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

