import axios from "axios"

/**
 * Script para testar a criação de depósito PIX
 * Este script simula um cliente fazendo uma requisição para criar um depósito
 */
async function testCreateDeposit() {
  try {
    // Substitua pelo seu token JWT válido
    const token = "seu_token_jwt_aqui" // Você pode obtê-lo fazendo login na sua aplicação

    // Dados do depósito
    const depositData = {
      amount: 100, // Valor do depósito em reais
    }

    console.log("Iniciando teste de criação de depósito PIX...")
    console.log("Dados do depósito:", depositData)

    // Fazendo a requisição para o endpoint de depósito
    const response = await axios.post("http://localhost:3000/api/transactions/deposit", depositData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("\n✅ Depósito PIX criado com sucesso!")
    console.log("Status da resposta:", response.status)
    console.log("Dados da resposta:", JSON.stringify(response.data, null, 2))

    // Extrair informações importantes
    const { depositId, pixCode, status } = response.data

    console.log("\nInformações do depósito:")
    console.log("ID do depósito:", depositId)
    console.log("Código PIX:", pixCode)
    console.log("Status:", status)
    console.log("\nIMPORTANTE: Guarde o ID do depósito para verificar o status posteriormente.")

    // Retornar o ID do depósito para uso posterior
    return depositId
  } catch (error: any) {
    console.error("\n❌ Erro ao criar depósito PIX:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else if (error.request) {
      console.error("Sem resposta do servidor. Verifique se o servidor está rodando.")
    } else {
      console.error("Erro ao configurar a requisição:", error.message)
    }

    return null
  }
}

// Executar o teste
console.log("=== TESTE DE CRIAÇÃO DE DEPÓSITO PIX ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

testCreateDeposit()
  .then((depositId) => {
    console.log("\n=== RESUMO ===")
    if (depositId) {
      console.log("Processo concluído com sucesso!")
      console.log("ID do depósito:", depositId)
      console.log("\nPróximos passos:")
      console.log("1. Use o código PIX para simular um pagamento")
      console.log("2. Monitore a interface do ngrok em http://127.0.0.1:4040 para ver os webhooks")
      console.log("3. Verifique os logs do seu servidor para confirmar o processamento do webhook")
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

