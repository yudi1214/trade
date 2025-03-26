import axios from "axios"

async function testXGateAuth() {
  const email = "maurilioxgate@xgate.com.br"
  const password = "maurilioxgate@123"
  const url_api = "https://api.xgateglobal.com"

  try {
    console.log("Tentando autenticar na API XGate...")
    const response = await axios.post(`${url_api}/auth/token`, { email, password })
    console.log("Autenticação bem-sucedida!")
    console.log("Token:", response.data.token || response.data.access_token)
    return response.data
  } catch (error: any) {
    console.error("Erro na autenticação:")
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
testXGateAuth()
  .then((data) => {
    if (data) {
      console.log("Dados completos da resposta:", data)
    }
  })
  .catch((err) => {
    console.error("Erro ao executar o teste:", err)
  })

