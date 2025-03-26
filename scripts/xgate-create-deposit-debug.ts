import axios from "axios"

/**
 * Script para criar um depósito PIX na XGate com logs detalhados
 */
async function createPixDeposit() {
  // Credenciais da XGate
  const XGATE_API_URL = "https://api.xgateglobal.com"
  const XGATE_EMAIL = "maurilioxgate@xgate.com.br"
  const XGATE_PASSWORD = "maurilioxgate@123"

  try {
    console.log("Autenticando na API XGate...")
    const loginResponse = await axios.post(`${XGATE_API_URL}/auth/token`, {
      email: XGATE_EMAIL,
      password: XGATE_PASSWORD,
    })

    const token = loginResponse.data.token || loginResponse.data.access_token
    console.log("✅ Autenticação bem-sucedida. Token obtido.")

    // Buscar moeda PIX
    console.log("\nBuscando detalhes da moeda...")
    const currenciesResponse = await axios.get(`${XGATE_API_URL}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const pixCurrency = currenciesResponse.data.find((c: any) => c.type === "PIX" && c.name === "BRL")

    if (!pixCurrency) {
      throw new Error("Moeda PIX (BRL) não encontrada")
    }

    console.log("Moeda PIX encontrada:", JSON.stringify(pixCurrency, null, 2))

    // Criar ou obter cliente
    console.log("\nCriando cliente de teste...")
    const customerData = {
      name: "Cliente Teste Trading Platform",
      email: "cliente.teste@example.com",
      phone: "11999999999",
    }

    let customerId: string
    try {
      const customerResponse = await axios.post(`${XGATE_API_URL}/customer`, customerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Resposta da criação do cliente:", JSON.stringify(customerResponse.data, null, 2))
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

    // Criar depósito PIX
    console.log("\nCriando depósito PIX...")
    const depositData = {
      amount: 100, // Valor do depósito em reais
      customerId,
      currency: pixCurrency._id,
    }

    console.log("Dados do depósito:", JSON.stringify(depositData, null, 2))

    const depositResponse = await axios.post(`${XGATE_API_URL}/deposit`, depositData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Status da resposta:", depositResponse.status)
    console.log("Resposta:", JSON.stringify(depositResponse.data, null, 2))

    // Extrair informações do depósito
    let depositInfo: any = null

    if (depositResponse.data.data) {
      console.log("Usando caminho: depositResponse.data.data")
      depositInfo = depositResponse.data.data
    } else if (depositResponse.data.deposit) {
      console.log("Usando caminho: depositResponse.data.deposit")
      depositInfo = depositResponse.data.deposit
    } else {
      console.log("Usando caminho: depositResponse.data (raiz)")
      depositInfo = depositResponse.data
    }

    console.log("\n✅ Depósito PIX criado com sucesso!")
    console.log("\nInformações do depósito:")
    console.log("Tipo:", typeof depositInfo)
    console.log("Propriedades disponíveis:", Object.keys(depositInfo))

    // Exibir todas as propriedades disponíveis
    console.log("\nValores das propriedades:")
    Object.entries(depositInfo).forEach(([key, value]) => {
      console.log(`${key}: ${JSON.stringify(value)}`)
    })

    return depositInfo
  } catch (error: any) {
    console.error("\n❌ Erro ao criar depósito PIX:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else {
      console.error("Erro:", error.message)
    }

    return null
  }
}

// Executar o script
console.log("=== TESTE DE CRIAÇÃO DE DEPÓSITO PIX XGATE (DEBUG) ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

createPixDeposit()
  .then((depositInfo) => {
    console.log("\n=== RESUMO ===")
    if (depositInfo) {
      console.log("✅ Processo concluído com sucesso!")

      if (depositInfo.id) {
        console.log("ID do depósito:", depositInfo.id)
        console.log("\nPara verificar o status do depósito posteriormente, execute:")
        console.log(`npx ts-node scripts/check-deposit-status-debug.ts ${depositInfo.id}`)
      } else {
        console.log("⚠️ ID do depósito não encontrado na resposta")
      }

      if (depositInfo.code) {
        console.log("Código PIX:", depositInfo.code)
      }

      if (depositInfo.status) {
        console.log("Status:", depositInfo.status)
      }
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

