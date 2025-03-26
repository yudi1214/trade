import axios from "axios"

/**
 * Script para listar todas as moedas disponíveis na XGate
 * e verificar quais estão habilitadas para a conta
 */
async function listAvailableCurrencies() {
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

    // Listar todas as moedas disponíveis
    console.log("\nListando todas as moedas disponíveis...")
    const currenciesResponse = await axios.get(`${XGATE_API_URL}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const currencies = currenciesResponse.data
    console.log(`Encontradas ${currencies.length} moedas.`)

    // Exibir detalhes de cada moeda
    console.log("\nDetalhes das moedas:")
    console.log("--------------------")

    currencies.forEach((currency: any, index: number) => {
      console.log(`[${index + 1}] ID: ${currency._id}`)
      console.log(`    Nome: ${currency.name}`)
      console.log(`    Tipo: ${currency.type}`)
      console.log(`    Símbolo: ${currency.symbol}`)
      console.log(`    Criada em: ${new Date(currency.createdDate).toLocaleString()}`)
      console.log(`    Atualizada em: ${new Date(currency.updatedDate).toLocaleString()}`)
      console.log("--------------------")
    })

    // Verificar se há moedas PIX
    const pixCurrencies = currencies.filter((c: any) => c.type === "PIX")
    console.log(`\nMoedas PIX encontradas: ${pixCurrencies.length}`)

    if (pixCurrencies.length > 0) {
      console.log("Moedas PIX disponíveis:")
      pixCurrencies.forEach((currency: any, index: number) => {
        console.log(`[${index + 1}] ID: ${currency._id}, Nome: ${currency.name}, Símbolo: ${currency.symbol}`)
      })
    } else {
      console.log("⚠️ Nenhuma moeda PIX encontrada!")
    }

    // Verificar moedas habilitadas para a empresa
    console.log("\nVerificando moedas habilitadas para a empresa...")
    try {
      const enabledCurrenciesResponse = await axios.get(`${XGATE_API_URL}/company/currencies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const enabledCurrencies = enabledCurrenciesResponse.data
      console.log(`Moedas habilitadas: ${enabledCurrencies.length}`)

      console.log("\nDetalhes das moedas habilitadas:")
      console.log("--------------------")

      enabledCurrencies.forEach((currency: any, index: number) => {
        console.log(`[${index + 1}] ID: ${currency._id || currency.id}`)
        console.log(`    Nome: ${currency.name}`)
        console.log(`    Tipo: ${currency.type}`)
        console.log(`    Símbolo: ${currency.symbol}`)
        console.log("--------------------")
      })

      // Verificar se há moedas PIX habilitadas
      const enabledPixCurrencies = enabledCurrencies.filter((c: any) => c.type === "PIX")
      console.log(`\nMoedas PIX habilitadas: ${enabledPixCurrencies.length}`)

      if (enabledPixCurrencies.length > 0) {
        console.log("Moedas PIX habilitadas:")
        enabledPixCurrencies.forEach((currency: any, index: number) => {
          console.log(
            `[${index + 1}] ID: ${currency._id || currency.id}, Nome: ${currency.name}, Símbolo: ${currency.symbol}`,
          )
        })
      } else {
        console.log("⚠️ Nenhuma moeda PIX habilitada para a empresa!")
      }
    } catch (error: any) {
      console.error("Erro ao verificar moedas habilitadas:", error.message)
      if (error.response) {
        console.error("Status:", error.response.status)
        console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
      }
    }

    return currencies
  } catch (error: any) {
    console.error("Erro ao listar moedas:")
    if (error.response) {
      console.error("Status:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else {
      console.error(error.message)
    }
    return null
  }
}

// Executar o script
console.log("=== LISTAGEM DE MOEDAS DISPONÍVEIS NA XGATE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

listAvailableCurrencies()
  .then((currencies) => {
    console.log("\n=== RESUMO ===")
    if (currencies) {
      console.log(`Total de moedas encontradas: ${currencies.length}`)
      console.log("\nPróximos passos:")
      console.log("1. Verifique se há moedas PIX na lista")
      console.log(
        "2. Se não houver moedas PIX ou se elas não estiverem habilitadas, entre em contato com o suporte da XGate",
      )
      console.log("3. Solicite a habilitação da moeda PIX (BRL) para a sua conta")
    } else {
      console.log("❌ Falha ao listar moedas. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o script:", err)
    console.error("===============================")
  })

