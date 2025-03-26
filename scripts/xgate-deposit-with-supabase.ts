import axios from "axios"
import { supabase } from "../lib/supabase"

/**
 * Script para criar um depósito PIX na XGate e salvá-lo no Supabase
 * Adaptado para a estrutura real das tabelas
 */
async function createDepositWithSupabase() {
  // Credenciais de autenticação
  const email = "maurilioxgate@xgate.com.br"
  const password = "maurilioxgate@123"
  const url_api = "https://api.xgateglobal.com"

  // Usar o ID de usuário existente que encontramos
  const userId = "7077a227-23ac-48e7-8ed0-2efa43602c6b"

  // Dados do depósito
  const customerId = "67de2322bbf0316b4edca8df" // ID do cliente que você criou
  const currencyId = "6728f0a2cba3ac9ea3009993" // ID da moeda PIX (BRL)
  const amount = 100 // Valor do depósito em reais

  try {
    console.log("Verificando conexão com o Supabase...")
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("❌ Erro ao verificar usuário no Supabase:", userError.message)
      return null
    }

    console.log("✅ Usuário encontrado no Supabase:", userData.name, userData.email)
    console.log("Saldo atual:", userData.real_balance)

    // Passo 1: Fazer login para obter o token
    console.log("\nAutenticando na API XGate...")
    const loginResponse = await axios.post(`${url_api}/auth/token`, { email, password })
    const token = loginResponse.data.token || loginResponse.data.access_token

    if (!token) {
      throw new Error("Token não encontrado na resposta de autenticação")
    }

    console.log("✅ Autenticação bem-sucedida. Token obtido.")

    // Passo 2: Buscar detalhes da moeda
    console.log("\nBuscando detalhes da moeda...")
    const currenciesResponse = await axios.get(`${url_api}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const currencies = currenciesResponse.data
    const pixCurrency = currencies.find((c: any) => c._id === currencyId)

    if (!pixCurrency) {
      throw new Error("Moeda PIX não encontrada")
    }

    console.log("✅ Moeda PIX encontrada:", pixCurrency.name, pixCurrency.symbol)

    // Passo 3: Criar o depósito PIX
    console.log("\nCriando depósito PIX...")

    // IMPORTANTE: Enviar o objeto completo da moeda, não apenas o ID
    const depositData = {
      amount,
      customerId,
      currency: pixCurrency,
    }

    console.log("Dados do depósito:", JSON.stringify(depositData, null, 2))

    const depositResponse = await axios.post(`${url_api}/deposit`, depositData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("\n✅ Depósito PIX criado com sucesso!")
    console.log("Status da resposta:", depositResponse.status)
    console.log("Resposta:", JSON.stringify(depositResponse.data, null, 2))

    // Extrair informações importantes da resposta
    const depositInfo = depositResponse.data.data

    console.log("\nInformações do depósito:")
    console.log("ID do depósito:", depositInfo.id)
    console.log("Código PIX:", depositInfo.code)
    console.log("Status:", depositInfo.status)

    // Passo 4: Salvar mapeamento no Supabase
    console.log("\nSalvando mapeamento no Supabase...")

    // Verificar a estrutura da tabela xgate_customer_mapping
    console.log("Verificando estrutura da tabela xgate_customer_mapping...")
    try {
      const { data: mappingColumns, error: mappingError } = await supabase
        .from("xgate_customer_mapping")
        .select("*")
        .limit(0)

      if (mappingError) {
        console.error("❌ Erro ao verificar estrutura da tabela xgate_customer_mapping:", mappingError.message)
      } else {
        console.log("✅ Estrutura da tabela xgate_customer_mapping verificada")

        // Tentar inserir o mapeamento
        const mappingData = {
          user_id: userId,
          customer_id: customerId,
        }

        console.log("Inserindo mapeamento:", mappingData)

        const { error: insertMappingError } = await supabase.from("xgate_customer_mapping").insert(mappingData)

        if (insertMappingError) {
          console.error("❌ Erro ao inserir mapeamento:", insertMappingError.message)
          console.log("Continuando mesmo com erro no mapeamento...")
        } else {
          console.log("✅ Mapeamento inserido com sucesso!")
        }
      }
    } catch (e) {
      console.error("❌ Erro ao verificar tabela xgate_customer_mapping:", e)
      console.log("Continuando mesmo com erro no mapeamento...")
    }

    // Passo 5: Salvar transação no Supabase
    console.log("\nSalvando transação no Supabase...")

    // Verificar a estrutura da tabela transactions
    console.log("Verificando estrutura da tabela transactions...")
    try {
      const { data: transactionColumns, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .limit(0)

      if (transactionError) {
        console.error("❌ Erro ao verificar estrutura da tabela transactions:", transactionError.message)
      } else {
        console.log("✅ Estrutura da tabela transactions verificada")

        // Tentar diferentes estruturas possíveis para a tabela transactions
        // Versão 1: Com coluna 'reference'
        try {
          const transactionData1 = {
            user_id: userId,
            type: "deposit",
            amount: amount,
            status: "pending",
            reference: depositInfo.id,
            details: depositInfo,
          }

          console.log("Tentando inserir transação (versão 1):", transactionData1)

          const { error: insertError1 } = await supabase.from("transactions").insert(transactionData1)

          if (insertError1) {
            console.error("❌ Erro ao inserir transação (versão 1):", insertError1.message)

            // Versão 2: Com coluna 'external_id' em vez de 'reference'
            const transactionData2 = {
              user_id: userId,
              type: "deposit",
              amount: amount,
              status: "pending",
              external_id: depositInfo.id,
              details: depositInfo,
            }

            console.log("Tentando inserir transação (versão 2):", transactionData2)

            const { error: insertError2 } = await supabase.from("transactions").insert(transactionData2)

            if (insertError2) {
              console.error("❌ Erro ao inserir transação (versão 2):", insertError2.message)

              // Versão 3: Estrutura mínima
              const transactionData3 = {
                user_id: userId,
                type: "deposit",
                amount: amount,
                status: "pending",
              }

              console.log("Tentando inserir transação (versão 3):", transactionData3)

              const { error: insertError3 } = await supabase.from("transactions").insert(transactionData3)

              if (insertError3) {
                console.error("❌ Erro ao inserir transação (versão 3):", insertError3.message)
                console.log("Não foi possível inserir a transação no Supabase")
              } else {
                console.log("✅ Transação inserida com sucesso (versão 3)!")
              }
            } else {
              console.log("✅ Transação inserida com sucesso (versão 2)!")
            }
          } else {
            console.log("✅ Transação inserida com sucesso (versão 1)!")
          }
        } catch (e) {
          console.error("❌ Erro ao inserir transação:", e)
        }
      }
    } catch (e) {
      console.error("❌ Erro ao verificar tabela transactions:", e)
    }

    return {
      depositId: depositInfo.id,
      pixCode: depositInfo.code,
      status: depositInfo.status,
      userId,
      customerId,
    }
  } catch (error: any) {
    console.error("\n❌ Erro ao criar depósito PIX:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else if (error.request) {
      console.error("Sem resposta do servidor. Verifique sua conexão com a internet.")
    } else {
      console.error("Erro ao configurar a requisição:", error.message)
    }

    return null
  }
}

// Executar o script
console.log("=== CRIAÇÃO DE DEPÓSITO PIX COM SUPABASE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

createDepositWithSupabase()
  .then((result) => {
    console.log("\n=== RESUMO ===")
    if (result) {
      console.log("✅ Processo concluído com sucesso!")
      console.log("ID do depósito:", result.depositId)
      console.log("Código PIX:", result.pixCode)
      console.log("Status:", result.status)
      console.log("ID do usuário:", result.userId)
      console.log("\nPróximos passos:")
      console.log("1. Use o código PIX para realizar o pagamento (se desejar)")
      console.log("2. Para simular um webhook de confirmação, execute:")
      console.log(`npx ts-node scripts/simulate-webhook-for-user.ts ${result.depositId} ${result.userId}`)
    } else {
      console.log("❌ Falha ao criar depósito PIX. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o script:", err)
    console.error("===============================")
  })

