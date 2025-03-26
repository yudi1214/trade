import axios from "axios"
import { supabase } from "../lib/supabase"

/**
 * Script para testar o fluxo de saque PIX
 * 1. Criar solicitação de saque diretamente na XGate
 * 2. Registrar no Supabase
 */
async function testWithdrawFlow() {
  try {
    console.log("Verificando conexão com o Supabase...")
    const { data: testData, error: testError } = await supabase.from("xgate_customer_mapping").select("*").limit(1)

    if (testError) {
      console.error("❌ Erro ao conectar com o Supabase:", testError.message)
      console.error("Verifique se as variáveis de ambiente estão configuradas corretamente.")
      return null
    }

    console.log("✅ Conexão com o Supabase estabelecida!")

    // Credenciais da XGate
    const XGATE_API_URL = "https://api.xgateglobal.com"
    const XGATE_EMAIL = "maurilioxgate@xgate.com.br"
    const XGATE_PASSWORD = "maurilioxgate@123"

    // Passo 1: Autenticar na XGate
    console.log("\n1. Autenticando na API XGate...")
    const loginResponse = await axios.post(`${XGATE_API_URL}/auth/token`, {
      email: XGATE_EMAIL,
      password: XGATE_PASSWORD,
    })

    const token = loginResponse.data.token || loginResponse.data.access_token
    console.log("✅ Autenticação bem-sucedida. Token obtido.")

    // Passo 2: Obter moedas disponíveis para saque
    console.log("\n2. Buscando moedas disponíveis para saque...")
    const currenciesResponse = await axios.get(`${XGATE_API_URL}/withdraw/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const currencies = currenciesResponse.data
    const pixCurrency = currencies.find((c: any) => c.type === "PIX" && c.name === "BRL")

    if (!pixCurrency) {
      throw new Error("Moeda PIX não disponível para saque")
    }

    console.log("✅ Moeda PIX encontrada:", pixCurrency.name, pixCurrency.symbol)

    // Passo 3: Usar o cliente existente
    const customerId = "67de2322bbf0316b4edca8df" // ID do cliente que já funciona
    console.log("\n3. Usando cliente existente com ID:", customerId)

    // Passo 4: Criar chave PIX de teste
    console.log("\n4. Criando chave PIX de teste...")
    const pixKeyObject = {
      key: "12345678909", // CPF de teste
      type: "CPF",
      _id: `temp_${Date.now()}`,
    }

    // Passo 5: Criar solicitação de saque
    console.log("\n5. Criando solicitação de saque...")
    const amount = 50 // Valor mínimo para saque

    const withdrawData = {
      amount,
      customerId,
      currency: pixCurrency,
      pixKey: pixKeyObject,
    }

    console.log("Dados do saque:", JSON.stringify(withdrawData, null, 2))

    const withdrawResponse = await axios.post(`${XGATE_API_URL}/withdraw`, withdrawData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const withdrawInfo = withdrawResponse.data.data || withdrawResponse.data
    console.log("✅ Solicitação de saque criada com sucesso!")
    console.log("ID da solicitação:", withdrawInfo.id)
    console.log("Status:", withdrawInfo.status || "PENDING")

    // Passo 6: Registrar transação no Supabase
    console.log("\n6. Registrando transação no Supabase...")
    const userId = "user-123" // ID de usuário de teste (mesmo usado no withAuth)

    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "withdraw",
      amount,
      status: "pending",
      date: new Date().toISOString(),
      details: withdrawInfo,
      reference: withdrawInfo.id,
    })

    if (transactionError) {
      console.error("❌ Erro ao registrar transação:", transactionError.message)
    } else {
      console.log("✅ Transação registrada com sucesso")
    }

    return {
      withdrawId: withdrawInfo.id,
      status: withdrawInfo.status || "PENDING",
      amount,
      customerId,
      userId,
    }
  } catch (error: any) {
    console.error("\n❌ Erro durante o teste de fluxo de saque:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else {
      console.error("Erro:", error.message)
    }

    return null
  }
}

// Executar o teste
console.log("=== TESTE DE FLUXO DE SAQUE PIX ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

testWithdrawFlow()
  .then((result) => {
    console.log("\n=== RESUMO ===")
    if (result) {
      console.log("✅ Teste de fluxo executado com sucesso!")
      console.log("ID da solicitação:", result.withdrawId)
      console.log("Status:", result.status)
      console.log("Valor:", result.amount)
      console.log("ID do cliente:", result.customerId)
      console.log("ID do usuário de teste:", result.userId)
      console.log("\nPróximos passos:")
      console.log("1. Inicie o servidor Next.js com 'npm run dev'")
      console.log("2. Acesse a página de saque e teste o formulário")
      console.log("3. Verifique se a transação foi registrada corretamente no Supabase")
    } else {
      console.log("❌ Falha no teste de fluxo de saque. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o teste:", err)
    console.error("===============================")
  })

