import axios from "axios"

async function createXGateDeposit() {
  // Credenciais de autenticação
  const email = "maurilioxgate@xgate.com.br"
  const password = "maurilioxgate@123"
  const url_api = "https://api.xgateglobal.com"

  // Dados do depósito
  const customerId = "67de2322bbf0316b4edca8df" // ID do cliente que você criou
  const currencyId = "6728f0a2cba3ac9ea3009993" // ID da moeda PIX (BRL)
  const amount = 100 // Valor do depósito em reais

  try {
    // Passo 1: Fazer login para obter o token
    console.log("Autenticando na API XGate...")
    const loginResponse = await axios.post(`${url_api}/auth/token`, { email, password })
    const token = loginResponse.data.token || loginResponse.data.access_token

    if (!token) {
      throw new Error("Token não encontrado na resposta de autenticação")
    }

    console.log("Autenticação bem-sucedida. Token obtido.")

    // Passo 2: Buscar detalhes da moeda
    console.log("\nBuscando detalhes da moeda...")
    const currenciesResponse = await axios.get(`${url_api}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const currencies = currenciesResponse.data
    const pixCurrency = currencies.find((c: any) => c._id === currencyId)

    if (!pixCurrency) {
      throw new Error("Moeda PIX não encontrada")
    }

    console.log("Moeda PIX encontrada:", pixCurrency)

    // Passo 3: Criar o depósito PIX
    console.log("\nCriando depósito PIX...")

    // Método 1: Usando customerId
    const depositData = {
      amount,
      customerId,
      currency: pixCurrency,
    }

    console.log("Dados do depósito:", JSON.stringify(depositData, null, 2))

    const depositResponse = await axios.post(`${url_api}/deposit`, depositData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("\n✅ Depósito PIX criado com sucesso!")
    console.log("Status da resposta:", depositResponse.status)
    console.log("Resposta:", JSON.stringify(depositResponse.data, null, 2))

    // Extrair informações importantes da resposta
    const depositInfo = depositResponse.data.data

    console.log("\nInformações do depósito:")
    console.log("ID do depósito:", depositInfo.id)
    console.log("Código PIX:", depositInfo.code)
    console.log("Status:", depositInfo.status)

    return {
      depositId: depositInfo.id,
      pixCode: depositInfo.code,
      status: depositInfo.status,
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
console.log("=== TESTE DE CRIAÇÃO DE DEPÓSITO PIX XGATE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

createXGateDeposit()
  .then((result) => {
    console.log("\n=== RESUMO ===")
    if (result) {
      console.log("Processo concluído com sucesso!")
      console.log("ID do depósito:", result.depositId)
      console.log("Código PIX:", result.pixCode)
      console.log("Status:", result.status)
      console.log("\nPara verificar o status do depósito posteriormente, guarde o ID do depósito.")
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

