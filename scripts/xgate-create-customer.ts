import axios from "axios"

async function createXGateCustomer() {
  // Credenciais de autenticação
  const email = "maurilioxgate@xgate.com.br"
  const password = "maurilioxgate@123"
  const url_api = "https://api.xgateglobal.com"

  // Dados do cliente a ser criado
  const customer = {
    name: "Cliente Teste Trading Platform",
    phone: "11999999999",
    email: "cliente.teste@example.com",
    document: "12345678900",
  }

  try {
    // Passo 1: Fazer login para obter o token
    console.log("Autenticando na API XGate...")
    const loginResponse = await axios.post(`${url_api}/auth/token`, { email, password })
    const token = loginResponse.data.token || loginResponse.data.access_token

    if (!token) {
      throw new Error("Token não encontrado na resposta de autenticação")
    }

    console.log("Autenticação bem-sucedida. Token obtido.")

    // Passo 2: Criar o cliente usando o token
    console.log("\nCriando cliente com os seguintes dados:")
    console.log(JSON.stringify(customer, null, 2))

    const customerResponse = await axios.post(`${url_api}/customer`, customer, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("\n✅ Cliente criado com sucesso!")
    console.log("Status da resposta:", customerResponse.status)
    console.log("Resposta:", JSON.stringify(customerResponse.data, null, 2))

    // Armazenar o ID do cliente para uso posterior
    const customerId = customerResponse.data.customer._id
    console.log("\nID do cliente:", customerId)

    return customerId
  } catch (error: any) {
    console.error("\n❌ Erro ao criar cliente:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))

      // Se o cliente já existir, tentar extrair o ID
      if (
        error.response.status === 409 ||
        (error.response.data &&
          error.response.data.message &&
          error.response.data.message.includes("já está cadastrado"))
      ) {
        console.log("\n⚠️ Cliente já existe. Tentando extrair o ID...")

        if (error.response.data && error.response.data.customer && error.response.data.customer._id) {
          const existingCustomerId = error.response.data.customer._id
          console.log("ID do cliente existente:", existingCustomerId)
          return existingCustomerId
        } else {
          console.log("Não foi possível extrair o ID do cliente existente da resposta.")
        }
      }
    } else if (error.request) {
      console.error("Sem resposta do servidor. Verifique sua conexão com a internet.")
    } else {
      console.error("Erro ao configurar a requisição:", error.message)
    }

    return null
  }
}

// Executar o teste
console.log("=== TESTE DE CRIAÇÃO DE CLIENTE XGATE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

createXGateCustomer()
  .then((customerId) => {
    console.log("\n=== RESUMO ===")
    if (customerId) {
      console.log("Processo concluído com sucesso!")
      console.log("ID do cliente:", customerId)
      console.log("Guarde este ID para usar nos próximos passos.")
    } else {
      console.log("❌ Falha ao criar cliente. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o teste:", err)
    console.error("===============================")
  })

