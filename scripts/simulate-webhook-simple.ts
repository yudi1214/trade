import axios from "axios"

/**
 * Script simplificado para simular um webhook da XGate
 * Não depende de obter detalhes do depósito da API
 */
async function simulateWebhook(depositId: string, status = "COMPLETED") {
  try {
    // URL do webhook (usando localhost para testes)
    const webhookUrl = "http://localhost:3000/api/webhooks/xgate/pix"

    // Simular o payload que a XGate enviaria
    const webhookPayload = {
      event: "deposit.status.updated",
      data: {
        id: depositId,
        status: status,
        customerId: "67de2322bbf0316b4edca8df", // ID do cliente que você já tem
        amount: 100, // Valor do depósito
        currency: "BRL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    console.log("\nEnviando webhook simulado para:", webhookUrl)
    console.log("Payload:", JSON.stringify(webhookPayload, null, 2))

    const webhookResponse = await axios.post(webhookUrl, webhookPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("\n✅ Webhook enviado com sucesso!")
    console.log("Status da resposta:", webhookResponse.status)
    console.log("Dados da resposta:", webhookResponse.data)

    return webhookResponse.data
  } catch (error: any) {
    console.error("\n❌ Erro ao simular webhook:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else {
      console.error("Erro:", error.message)
    }

    return null
  }
}

// ID do depósito a ser usado no webhook simulado
const depositId = process.argv[2] || "67df383b3c3d74da151e86b1" // Use o ID do seu depósito aqui
const status = process.argv[3] || "COMPLETED" // Status a ser simulado (COMPLETED, CONFIRMED, etc.)

// Executar a simulação
console.log("=== SIMULAÇÃO DE WEBHOOK XGATE (SIMPLIFICADO) ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

simulateWebhook(depositId, status)
  .then((result) => {
    console.log("\n=== RESUMO ===")
    if (result) {
      console.log("✅ Simulação de webhook concluída com sucesso!")
      console.log("Resposta:", result)
      console.log("\nPróximos passos:")
      console.log("1. Verifique os logs do servidor para confirmar o processamento do webhook")
      console.log("2. Verifique se a transação foi atualizada para 'completed' no Supabase")
      console.log("3. Verifique se o saldo do usuário foi atualizado corretamente")
    } else {
      console.log("❌ Falha na simulação do webhook. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar a simulação:", err)
    console.error("===============================")
  })

