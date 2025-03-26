import axios from "axios"

/**
 * Script para simular manualmente um webhook da XGate
 * Use este script se o servidor Next.js estiver rodando em um terminal separado
 */
async function simulateWebhookManual(depositId: string) {
  try {
    // URL do webhook (usando localhost para testes)
    const webhookUrl = "http://localhost:3000/api/webhooks/xgate/pix"

    // ID do cliente existente
    const customerId = "67de2322bbf0316b4edca8df"

    // Valor do depósito
    const amount = 100

    // Simular o payload que a XGate enviaria
    const webhookPayload = {
      event: "deposit.status.updated",
      data: {
        id: depositId,
        status: "COMPLETED",
        customerId: customerId,
        amount: amount,
        currency: "BRL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    console.log("Enviando webhook simulado para:", webhookUrl)
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
const depositId = process.argv[2]

if (!depositId) {
  console.error("❌ Erro: ID do depósito não fornecido!")
  console.error("Uso: npx ts-node scripts/simulate-webhook-manual.ts ID_DO_DEPOSITO")
  process.exit(1)
}

// Executar a simulação
console.log("=== SIMULAÇÃO MANUAL DE WEBHOOK XGATE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

simulateWebhookManual(depositId)
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
      console.log("\nPossíveis causas:")
      console.log("1. O servidor Next.js não está rodando")
      console.log("2. A rota do webhook não está implementada corretamente")
      console.log("3. Há um erro no processamento do webhook")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar a simulação:", err)
    console.error("===============================")
  })

