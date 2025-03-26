import axios from "axios"

/**
 * Script para criar um depósito PIX diretamente usando o formato da documentação
 */
async function createPixDepositDirect() {
  // Credenciais da XGate
  const email = "maurilioxgate@xgate.com.br"
  const password = "maurilioxgate@123"
  const url_api = "https://api.xgateglobal.com"

  try {
    console.log("Autenticando na API XGate...")
    const login = await axios.post(`${url_api}/auth/token`, { email, password })
    const token = login.data.token
    console.log("✅ Autenticação bem-sucedida. Token obtido.")

    // Obter moedas disponíveis
    console.log("\nObtendo moedas disponíveis...")
    const { data: currencies } = await axios.get(`${url_api}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Moedas disponíveis:", JSON.stringify(currencies, null, 2))

    // Encontrar a moeda PIX
    const pixCurrency = currencies.find((c: any) => c.type === "PIX" && c.name === "BRL")

    if (!pixCurrency) {
      console.error("❌ Moeda PIX (BRL) não encontrada!")
      return null
    }

    console.log(`✅ Moeda PIX encontrada: ${pixCurrency.name} (${pixCurrency.symbol})`)
    console.log(`ID da moeda: ${pixCurrency._id}`)

    // Criar ou obter cliente
    console.log("\nCriando cliente de teste...")
    const customerData = {
      name: "Cliente Teste Trading Platform",
      email: "cliente.teste@example.com",
      phone: "11999999999",
    }

    let customerId
    try {
      const customerResponse = await axios.post(`${url_api}/customer`, customerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      customerId = customerResponse.data.customer._id
      console.log("✅ Cliente criado com sucesso. ID:", customerId)
    } catch (error: any) {
      // Se o cliente já existir, tentar extrair o ID do erro
      if (error.response && error.response.status === 409 && error.response.data.customer) {
        customerId = error.response.data.customer._id
        console.log("✅ Cliente já existe. ID:", customerId)
      } else {
        throw error
      }
    }

    // Criar depósito PIX
    console.log("\nCriando depósito PIX...")
    const depositData = {
      amount: 100, // Valor do depósito em reais
      customerId,
      currency: pixCurrency._id,
    }

    console.log("Dados do depósito:", JSON.stringify(depositData, null, 2))

    const depositResponse = await axios.post(`${url_api}/deposit`, depositData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const depositInfo = depositResponse.data.data

    console.log("\n✅ Depósito PIX criado com sucesso!")
    console.log("ID do depósito:", depositInfo.id)
    console.log("Código PIX:", depositInfo.code)
    console.log("Status:", depositInfo.status)

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

// Executar o script
console.log("=== CRIAÇÃO DE DEPÓSITO PIX DIRETO ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

createPixDepositDirect()
  .then((result) => {
    console.log("\n=== RESUMO ===")
    if (result) {
      console.log("✅ Processo concluído com sucesso!")
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
    console.error("Erro não tratado ao executar o script:", err)
    console.error("===============================")
  })

