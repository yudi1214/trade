import axios from "axios"

/**
 * Script para verificar o status de um depósito PIX na XGate
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
    const depositResponse = await axios.get(`${XGATE_API_URL}/deposit/${depositId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const depositInfo = depositResponse.data.data
    console.log("\n✅ Informações do depósito obtidas com sucesso!")
    console.log("ID do depósito:", depositInfo.id)
    console.log("Status atual:", depositInfo.status)
    console.log("Cliente:", depositInfo.customerId)
    console.log("Valor:", depositInfo.amount)
    console.log("Moeda:", depositInfo.currency)
    console.log("Código PIX:", depositInfo.code)
    console.log("Data de criação:", new Date(depositInfo.createdAt).toLocaleString())
    console.log("Última atualização:", new Date(depositInfo.updatedAt).toLocaleString())

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

// ID do depósito a ser verificado (use o ID do depósito que você criou)
const depositId = process.argv[2] || "67df383b3c3d74da151e86b1" // Use o ID do seu depósito aqui

// Executar a verificação
console.log("=== VERIFICAÇÃO DE STATUS DE DEPÓSITO PIX ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

checkDepositStatus(depositId)
  .then((depositInfo) => {
    console.log("\n=== RESUMO ===")
    if (depositInfo) {
      console.log("✅ Verificação concluída com sucesso!")
      console.log(`Status atual: ${depositInfo.status}`)

      if (depositInfo.status === "WAITING_PAYMENT") {
        console.log("\nO pagamento ainda não foi realizado.")
        console.log("Instruções:")
        console.log("1. Use o código PIX para realizar o pagamento")
        console.log("2. Após o pagamento, execute este script novamente para verificar se o status foi atualizado")
      } else if (depositInfo.status === "COMPLETED" || depositInfo.status === "CONFIRMED") {
        console.log("\n🎉 Pagamento confirmado!")
        console.log("O webhook deve ser acionado automaticamente para atualizar o saldo do usuário")
      } else {
        console.log(`\nStatus atual: ${depositInfo.status}`)
        console.log("Aguarde a atualização do status ou entre em contato com o suporte da XGate")
      }
    } else {
      console.log("❌ Falha ao verificar status do depósito. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar a verificação:", err)
    console.error("===============================")
  })

