import axios from "axios"

/**
 * Script para listar os depósitos recentes na XGate
 * Versão corrigida com tipos explícitos
 */
async function listDeposits() {
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

    console.log("\nListando depósitos recentes...")
    const depositsResponse = await axios.get(`${XGATE_API_URL}/deposit`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Log da resposta completa para debug
    console.log("\nResposta completa da API:")
    console.log(JSON.stringify(depositsResponse.data, null, 2))

    // Verificar se a resposta contém os dados esperados
    if (!depositsResponse.data) {
      throw new Error("Resposta da API não contém dados")
    }

    // Extrair a lista de depósitos
    let deposits: any[] = []
    if (Array.isArray(depositsResponse.data)) {
      deposits = depositsResponse.data
    } else if (depositsResponse.data.data && Array.isArray(depositsResponse.data.data)) {
      deposits = depositsResponse.data.data
    } else if (depositsResponse.data.deposits && Array.isArray(depositsResponse.data.deposits)) {
      deposits = depositsResponse.data.deposits
    }

    if (deposits.length === 0) {
      console.log("\n⚠️ Nenhum depósito encontrado")
      return []
    }

    console.log(`\n✅ Encontrados ${deposits.length} depósitos`)

    // Exibir informações sobre cada depósito
    deposits.forEach((deposit: any, index: number) => {
      console.log(`\n--- Depósito ${index + 1} ---`)
      if (deposit.id) console.log("ID:", deposit.id)
      if (deposit.status) console.log("Status:", deposit.status)
      if (deposit.customerId) console.log("Cliente:", deposit.customerId)
      if (deposit.amount) console.log("Valor:", deposit.amount)
      if (deposit.currency) console.log("Moeda:", deposit.currency)
      if (deposit.createdAt) console.log("Criado em:", new Date(deposit.createdAt).toLocaleString())
    })

    return deposits
  } catch (error: any) {
    console.error("\n❌ Erro ao listar depósitos:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else {
      console.error("Erro:", error.message)
    }

    return null
  }
}

// Executar a listagem
console.log("=== LISTAGEM DE DEPÓSITOS XGATE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

listDeposits()
  .then((deposits) => {
    console.log("\n=== RESUMO ===")
    if (deposits) {
      console.log(`Total de depósitos encontrados: ${deposits.length}`)

      if (deposits.length > 0) {
        console.log("\nPróximos passos:")
        console.log("1. Use o ID de um dos depósitos listados para verificar seu status")
        console.log("2. Execute o script check-deposit-status-debug.ts com o ID do depósito")
        console.log("   Exemplo: npx ts-node scripts/check-deposit-status-debug.ts ID_DO_DEPOSITO")
      } else {
        console.log(
          "\nNenhum depósito encontrado. Você pode criar um novo depósito com o script xgate-create-deposit.ts",
        )
      }
    } else {
      console.log("❌ Falha ao listar depósitos. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar a listagem:", err)
    console.error("===============================")
  })

