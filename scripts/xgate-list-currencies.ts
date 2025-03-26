import axios from "axios"

async function listXGateCurrencies() {
  // Credenciais de autenticação
  const email = "maurilioxgate@xgate.com.br"
  const password = "maurilioxgate@123"
  const url_api = "https://api.xgateglobal.com"

  try {
    // Passo 1: Fazer login para obter o token
    console.log("Autenticando na API XGate...")
    const loginResponse = await axios.post(`${url_api}/auth/token`, { email, password })
    const token = loginResponse.data.token || loginResponse.data.access_token

    if (!token) {
      throw new Error("Token não encontrado na resposta de autenticação")
    }

    console.log("Autenticação bem-sucedida. Token obtido.")

    // Passo 2: Listar as moedas fiduciárias disponíveis
    console.log("Buscando moedas disponíveis...")
    const currenciesResponse = await axios.get(`${url_api}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Moedas obtidas com sucesso!")

    // Exibir as moedas disponíveis
    const currencies = currenciesResponse.data
    console.log("Moedas disponíveis:", JSON.stringify(currencies, null, 2))

    // Encontrar a moeda BRL com tipo PIX
    const pixCurrency = currencies.find(
      (currency: any) => currency.name === "BRL" && currency.type === "PIX" && currency.symbol === "R$",
    )

    if (pixCurrency) {
      console.log("Moeda PIX encontrada:")
      console.log("ID:", pixCurrency._id)
      console.log("Nome:", pixCurrency.name)
      console.log("Tipo:", pixCurrency.type)
      console.log("Símbolo:", pixCurrency.symbol)

      return pixCurrency._id // Retornar o ID da moeda para uso posterior
    } else {
      console.log("Moeda PIX (BRL) não encontrada nas moedas disponíveis.")
      return null
    }
  } catch (error: any) {
    console.error("Erro ao listar moedas:")
    if (error.response) {
      console.error("Status:", error.response.status)
      console.error("Mensagem:", error.response.data.message || error.response.data)
    } else {
      console.error(error.message)
    }
    return null
  }
}

// Executar o teste
listXGateCurrencies()
  .then((currencyId) => {
    if (currencyId) {
      console.log("Processo concluído. ID da moeda PIX:", currencyId)
      // Você pode armazenar este ID em um arquivo ou variável de ambiente para uso posterior
    }
  })
  .catch((err) => {
    console.error("Erro ao executar o teste:", err)
  })

