import axios from "axios"
import { supabase } from "../lib/supabase"

/**
 * Script para testar a criação de depósito PIX diretamente na XGate
 * com verificação de moedas habilitadas
 */
async function testXGateDirectDeposit() {
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

    console.log("Autenticando na API XGate...")
    // Passo 1: Autenticar na XGate
    const loginResponse = await axios.post(`${XGATE_API_URL}/auth/token`, {
      email: XGATE_EMAIL,
      password: XGATE_PASSWORD,
    })

    const token = loginResponse.data.token || loginResponse.data.access_token
    console.log("Autenticação bem-sucedida. Token obtido.")

    // Passo 2: Verificar moedas habilitadas para a empresa
    console.log("\nVerificando moedas habilitadas para a empresa...")
    let enabledCurrencies
    try {
      const enabledCurrenciesResponse = await axios.get(`${XGATE_API_URL}/company/currencies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      enabledCurrencies = enabledCurrenciesResponse.data
      console.log(`Moedas habilitadas: ${enabledCurrencies.length}`)

      // Verificar se há moedas PIX habilitadas
      const enabledPixCurrencies = enabledCurrencies.filter((c: any) => c.type === "PIX")
      console.log(`Moedas PIX habilitadas: ${enabledPixCurrencies.length}`)

      if (enabledPixCurrencies.length > 0) {
        console.log("Moedas PIX habilitadas:")
        enabledPixCurrencies.forEach((currency: any, index: number) => {
          console.log(
            `[${index + 1}] ID: ${currency._id || currency.id}, Nome: ${currency.name}, Símbolo: ${currency.symbol}`,
          )
        })
      } else {
        console.log("⚠️ Nenhuma moeda PIX habilitada para a empresa!")
        console.log("Entre em contato com o suporte da XGate para habilitar a moeda PIX.")
        return null
      }
    } catch (error: any) {
      console.error("Erro ao verificar moedas habilitadas:", error.message)
      if (error.response) {
        console.error("Status:", error.response.status)
        console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
      }

      // Continuar com a lista geral de moedas
      console.log("Tentando usar a lista geral de moedas...")
    }

    // Passo 3: Obter moedas disponíveis (caso não tenha conseguido obter as habilitadas)
    if (!enabledCurrencies) {
      console.log("Buscando moedas disponíveis...")
      const currenciesResponse = await axios.get(`${XGATE_API_URL}/deposit/company/currencies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const currencies = currenciesResponse.data
      console.log(`Encontradas ${currencies.length} moedas.`)

      // Verificar se há moedas PIX
      const pixCurrencies = currencies.filter((c: any) => c.type === "PIX")
      console.log(`Moedas PIX encontradas: ${pixCurrencies.length}`)

      if (pixCurrencies.length === 0) {
        console.log("⚠️ Nenhuma moeda PIX encontrada!")
        console.log("Entre em contato com o suporte da XGate para verificar a disponibilidade de PIX.")
        return null
      }

      enabledCurrencies = currencies
    }

    // Passo 4: Selecionar a moeda PIX (BRL)
    const pixCurrency = enabledCurrencies.find((c: any) => c.type === "PIX" && c.name === "BRL")

    if (!pixCurrency) {
      console.log("⚠️ Moeda PIX (BRL) não encontrada!")
      console.log("Tentando usar qualquer moeda PIX disponível...")

      const anyPixCurrency = enabledCurrencies.find((c: any) => c.type === "PIX")

      if (!anyPixCurrency) {
        console.log("❌ Nenhuma moeda PIX disponível!")
        console.log("Entre em contato com o suporte da XGate para habilitar a moeda PIX.")
        return null
      }

      console.log(`Usando moeda PIX alternativa: ${anyPixCurrency.name} (${anyPixCurrency.symbol})`)
      pixCurrency = anyPixCurrency
    }

    console.log(`Moeda PIX selecionada: ${pixCurrency.name} (${pixCurrency.symbol})`)
    const pixCurrencyId = pixCurrency._id || pixCurrency.id
    console.log(`ID da moeda: ${pixCurrencyId}`)

    // Passo 5: Criar ou obter cliente
    console.log("\nCriando cliente de teste...")
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

    // Passo 6: Criar depósito PIX
    console.log("\nCriando depósito PIX...")
    const depositData = {
      amount: 100, // Valor do depósito em reais
      customerId,
      currency: pixCurrency._id || pixCurrency.id,
    }

    console.log("Dados do depósito:", JSON.stringify(depositData, null, 2))

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
      { onConflict: "customer_id" },
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
      console.log("\nPossíveis soluções:")
      console.log("1. Verifique se a moeda PIX está habilitada para a sua conta XGate")
      console.log("2. Entre em contato com o suporte da XGate para habilitar a moeda PIX")
      console.log("3. Verifique se as credenciais da XGate estão corretas")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o teste:", err)
    console.error("===============================")
  })

