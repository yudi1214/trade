// scripts/test-xgate-direct.ts
import axios from "axios"
import { supabase } from "../lib/supabase"

/**
 * Script para testar a criação de depósito PIX diretamente na XGate
 * Este script não depende de autenticação JWT
 */
async function testXGateDirectDeposit() {
  // Credenciais da XGate
  const XGATE_API_URL = "https://api.xgateglobal.com"
  const XGATE_EMAIL = "maurilioxgate@xgate.com.br"
  const XGATE_PASSWORD = "maurilioxgate@123"

  try {
    console.log("Verificando conexão com o Supabase...")
    // Corrigido: usar count() como uma função em vez de count(*)
    const { data: testData, error: testError } = await supabase
      .from("xgate_customer_mapping")
      .select("*", { count: "exact" })
      .limit(1)
    
    if (testError) {
      console.error("❌ Erro ao conectar com o Supabase:", testError.message)
      console.error("Verifique se as variáveis de ambiente estão configuradas corretamente.")
      return null
    }
    
    console.log("✅ Conexão com o Supabase estabelecida!")

    console.log("Autenticando na API XGate...")
    // Passo 1: Autenticar na XGate
    const loginResponse = await axios.post(`${XGATE_API_URL}/auth/token`, {
      email: XGATE_EMAIL,
      password: XGATE_PASSWORD,
    })

    const token = loginResponse.data.token || loginResponse.data.access_token
    console.log("Autenticação bem-sucedida. Token obtido.")

    // Passo 2: Obter moedas disponíveis
    console.log("Buscando moedas disponíveis...")
    const currenciesResponse = await axios.get(`${XGATE_API_URL}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const currencies = currenciesResponse.data
    const pixCurrency = currencies.find((c: any) => c.type === "PIX" && c.name === "BRL")

    if (!pixCurrency) {
      throw new Error("Moeda PIX não disponível")
    }

    console.log("Moeda PIX encontrada:", pixCurrency._id)

    // Passo 3: Criar ou obter cliente
    console.log("Criando cliente de teste...")
    const customerData = {
      name: "Cliente Teste Trading Platform",
      email: "cliente.teste@example.com",
      phone: "11999999999",
    }

    let customerId
    try {
      const customerResponse = await axios.post(`${XGATE_API_URL}/customer`, customerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      customerId = customerResponse.data.customer._id
      console.log("Cliente criado com sucesso. ID:", customerId)
    } catch (error: any) {
      // Se o cliente já existir, tentar extrair o ID do erro
      if (error.response && error.response.status === 409 && error.response.data.customer) {
        customerId = error.response.data.customer._id
        console.log("Cliente já existe. ID:", customerId)
      } else {
        throw error
      }
    }

    // Passo 4: Criar depósito PIX
    console.log("Criando depósito PIX...")
    const depositData = {
      amount: 100, // Valor do depósito em reais
      customerId,
      currency: pixCurrency._id,
    }

    const depositResponse = await axios.post(`${XGATE_API_URL}/deposit`, depositData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const depositInfo = depositResponse.data.data

    console.log("\n✅ Depósito PIX criado com sucesso!")
    console.log("ID do depósito:", depositInfo.id)
    console.log("Código PIX:", depositInfo.code)
    console.log("Status:", depositInfo.status)

    // Registrar no Supabase para testes
    console.log("\nRegistrando no Supabase para testes...")
    
    // Registrar mapeamento de cliente
    const { error: mappingError } = await supabase.from("xgate_customer_mapping").upsert(
      {
        user_id: "test_user_id", // ID de usuário de teste
        customer_id: customerId,
      },
      { onConflict: "customer_id" }
    )
    
    if (mappingError) {
      console.error("Erro ao registrar mapeamento:", mappingError.message)
    } else {
      console.log("Mapeamento de cliente registrado com sucesso")
    }
    
    // Registrar transação
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: "test_user_id", // ID de usuário de teste
      type: "deposit",
      amount: 100,
      status: "pending",
      reference: depositInfo.id,
      details: depositInfo,
    })
    
    if (transactionError) {
      console.error("Erro ao registrar transação:", transactionError.message)
    } else {
      console.log("Transação registrada com sucesso")
    }

    return {
      depositId: depositInfo.id,
      pixCode: depositInfo.code,
      status: depositInfo.status,
      customerId,
    }
  } catch (error: any) {
    console.error("\n❌ Erro ao criar depósito PIX:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else if (error.request) {
      console.error("Sem resposta do servidor. Verifique sua conexão com a internet.")
    } else {
      console.error("Erro ao configurar a requisição:", error.message)
    }

    return null
  }
}

// Executar o teste
console.log("=== TESTE DE CRIAÇÃO DE DEPÓSITO PIX DIRETO NA XGATE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

testXGateDirectDeposit()
  .then((result) => {
    console.log("\n=== RESUMO ===")
    if (result) {
      console.log("Processo concluído com sucesso!")
      console.log("ID do depósito:", result.depositId)
      console.log("Código PIX:", result.pixCode)
      console.log("Status:", result.status)
      console.log("ID do cliente:", result.customerId)
      console.log("\nIMPORTANTE: Guarde o ID do depósito para simular o webhook posteriormente.")
    } else {
      console.log("❌ Falha ao criar depósito PIX. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o teste:", err)
    console.error("===============================")
  })