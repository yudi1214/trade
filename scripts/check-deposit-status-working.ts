import axios from "axios"

/**
 * Script para verificar o status de um depósito PIX na XGate
 * Baseado no script xgate-create-deposit.ts que funciona
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

    // Tentar verificar o status usando a rota específica para depósitos
    console.log(`\nVerificando status do depósito ${depositId}...`)

    // Tentar diferentes rotas possíveis
    const possibleRoutes = [`/deposit/${depositId}`, `/deposit/status/${depositId}`, `/deposit/detail/${depositId}`]

    let depositInfo = null
    let successRoute = ""

    for (const route of possibleRoutes) {
      try {
        console.log(`Tentando rota: ${XGATE_API_URL}${route}`)
        const response = await axios.get(`${XGATE_API_URL}${route}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data) {
          console.log(`✅ Resposta obtida da rota ${route}`)
          depositInfo = response.data
          successRoute = route
          break
        }
      } catch (routeError: any) {
        console.log(`❌ Erro na rota ${route}: ${routeError.message}`)
        if (routeError.response) {
          console.log(`Status: ${routeError.response.status}`)
        }
      }
    }

    if (!depositInfo) {
      throw new Error("Não foi possível obter informações do depósito em nenhuma rota")
    }

    console.log(`\nRota bem-sucedida: ${successRoute}`)
    console.log("Resposta completa:", JSON.stringify(depositInfo, null, 2))

    // Tentar extrair as informações relevantes
    let depositData = null

    if (depositInfo.data) {
      depositData = depositInfo.data
    } else if (depositInfo.deposit) {
      depositData = depositInfo.deposit
    } else {
      depositData = depositInfo
    }

    console.log("\n✅ Informações do depósito:")
    console.log("Propriedades disponíveis:", Object.keys(depositData))

    // Exibir todas as propriedades disponíveis
    Object.entries(depositData).forEach(([key, value]) => {
      console.log(`${key}: ${JSON.stringify(value)}`)
    })

    return depositData
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
console.log("=== VERIFICAÇÃO DE STATUS DE DEPÓSITO PIX (VERSÃO ALTERNATIVA) ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

checkDepositStatus(depositId)
  .then((depositInfo) => {
    console.log("\n=== RESUMO ===")
    if (depositInfo) {
      console.log("✅ Verificação concluída com sucesso!")

      // Tentar extrair o status
      const status = depositInfo.status || "Desconhecido"
      console.log(`Status do depósito: ${status}`)

      if (status === "WAITING_PAYMENT" || status === "PENDING") {
        console.log("\nO pagamento ainda não foi realizado.")
        console.log("Instruções:")
        console.log("1. Use o código PIX para realizar o pagamento")
        console.log("2. Após o pagamento, execute este script novamente para verificar se o status foi atualizado")
      } else if (status === "COMPLETED" || status === "CONFIRMED") {
        console.log("\n🎉 Pagamento confirmado!")
        console.log("O webhook deve ser acionado automaticamente para atualizar o saldo do usuário")
      } else {
        console.log(`\nStatus atual: ${status}`)
        console.log("Aguarde a atualização do status ou entre em contato com o suporte da XGate")
      }
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

