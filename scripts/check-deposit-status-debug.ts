import axios from "axios"

/**
 * Script para verificar o status de um depósito PIX na XGate
 * Versão de debug com logs detalhados
 */
async function checkDepositStatus(depositId: string) {
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

    console.log(`\nVerificando status do depósito ${depositId}...`)

    // Adicionar logs para debug
    console.log(`URL da requisição: ${XGATE_API_URL}/deposit/${depositId}`)

    const depositResponse = await axios.get(`${XGATE_API_URL}/deposit/${depositId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Log da resposta completa para debug
    console.log("\nResposta completa da API:")
    console.log(JSON.stringify(depositResponse.data, null, 2))

    // Verificar a estrutura da resposta
    console.log("\nEstrutura da resposta:")
    console.log("Tipo da resposta:", typeof depositResponse.data)
    console.log("Propriedades no nível raiz:", Object.keys(depositResponse.data))

    // Tentar diferentes caminhos para acessar os dados
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

    // Verificar se temos as informações do depósito
    if (!depositInfo) {
      throw new Error("Não foi possível encontrar informações do depósito na resposta")
    }

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
    console.error("\n❌ Erro ao verificar status do depósito:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else {
      console.error("Erro:", error.message)
    }

    return null
  }
}

// ID do depósito a ser verificado
const depositId = process.argv[2] || "67df383b3c3d74da151e86b1"

// Executar a verificação
console.log("=== VERIFICAÇÃO DE STATUS DE DEPÓSITO PIX (DEBUG) ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

checkDepositStatus(depositId)
  .then((depositInfo) => {
    console.log("\n=== RESUMO ===")
    if (depositInfo) {
      console.log("✅ Verificação concluída com sucesso!")
      console.log("Informações do depósito obtidas. Verifique os logs acima para detalhes.")
    } else {
      console.log("❌ Falha ao verificar status do depósito. Verifique os erros acima.")
      console.log("\nPossíveis soluções:")
      console.log("1. Verifique se o ID do depósito está correto")
      console.log("2. Tente criar um novo depósito com o script xgate-create-deposit.ts")
      console.log("3. Verifique se você tem permissão para acessar este depósito")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar a verificação:", err)
    console.error("===============================")
  })

