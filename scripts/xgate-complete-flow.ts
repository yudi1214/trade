import axios from "axios"
import { supabase } from "../lib/supabase"

/**
 * Script completo para o fluxo de depósito PIX:
 * 1. Criar depósito na XGate
 * 2. Salvar no Supabase
 * 3. Simular webhook de confirmação
 * 4. Verificar status
 */
async function runCompleteFlow() {
  // Credenciais de autenticação
  const email = "maurilioxgate@xgate.com.br"
  const password = "maurilioxgate@123"
  const url_api = "https://api.xgateglobal.com"

  // ID de usuário válido para o Supabase (deve ser um UUID válido)
  const userId = "123e4567-e89b-12d3-a456-426614174000" // UUID de exemplo

  try {
    // Verificar conexão com o Supabase
    console.log("Verificando conexão com o Supabase...")
    const { data: testData, error: testError } = await supabase.from("transactions").select("*").limit(1)

    if (testError) {
      console.error("❌ Erro ao conectar com o Supabase:", testError.message)
      console.error("Verifique se as variáveis de ambiente estão configuradas corretamente.")
      return null
    }

    console.log("✅ Conexão com o Supabase estabelecida!")

    // PASSO 1: Criar depósito na XGate
    console.log("\n=== PASSO 1: CRIAR DEPÓSITO NA XGATE ===")

    // Autenticar na API XGate
    console.log("Autenticando na API XGate...")
    const loginResponse = await axios.post(`${url_api}/auth/token`, { email, password })
    const token = loginResponse.data.token || loginResponse.data.access_token

    if (!token) {
      throw new Error("Token não encontrado na resposta de autenticação")
    }

    console.log("✅ Autenticação bem-sucedida. Token obtido.")

    // Buscar detalhes da moeda
    console.log("\nBuscando detalhes da moeda...")
    const currenciesResponse = await axios.get(`${url_api}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const currencies = currenciesResponse.data
    const currencyId = "6728f0a2cba3ac9ea3009993" // ID da moeda PIX (BRL)
    const pixCurrency = currencies.find((c: any) => c._id === currencyId)

    if (!pixCurrency) {
      throw new Error("Moeda PIX não encontrada")
    }

    console.log("✅ Moeda PIX encontrada:", pixCurrency.name, pixCurrency.symbol)

    // Criar o depósito PIX
    console.log("\nCriando depósito PIX...")
    const customerId = "67de2322bbf0316b4edca8df" // ID do cliente existente
    const amount = 100 // Valor do depósito em reais

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

    // Extrair informações importantes da resposta
    const depositInfo = depositResponse.data.data

    console.log("\nInformações do depósito:")
    console.log("ID do depósito:", depositInfo.id)
    console.log("Código PIX:", depositInfo.code)
    console.log("Status:", depositInfo.status)

    // PASSO 2: Salvar no Supabase
    console.log("\n=== PASSO 2: SALVAR NO SUPABASE ===")

    // Verificar se já existe um mapeamento para este cliente
    console.log("Verificando mapeamento de cliente...")
    const { data: existingMapping } = await supabase
      .from("xgate_customer_mapping")
      .select("*")
      .eq("customer_id", customerId)
      .single()

    // Se não existir, salvar o mapeamento
    if (!existingMapping) {
      console.log(`Salvando mapeamento: usuário ${userId} -> cliente XGate ${customerId}`)
      const { error: mappingError } = await supabase.from("xgate_customer_mapping").insert({
        user_id: userId,
        customer_id: customerId,
      })

      if (mappingError) {
        console.error("❌ Erro ao salvar mapeamento:", mappingError.message)
        console.log("Continuando mesmo com erro no mapeamento...")
      } else {
        console.log("✅ Mapeamento salvo com sucesso!")
      }
    } else {
      console.log("✅ Mapeamento já existe:", existingMapping)
    }

    // Verificar se a transação já existe
    console.log("\nVerificando se a transação já existe...")
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("reference", depositInfo.id)
      .single()

    if (existingTransaction) {
      console.log("✅ Transação já existe no Supabase:", existingTransaction)
    } else {
      // Registrar a transação no Supabase
      console.log("\nRegistrando transação no Supabase...")
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "deposit",
        amount: amount,
        status: "pending",
        reference: depositInfo.id,
        details: depositInfo,
      })

      if (transactionError) {
        console.error("❌ Erro ao registrar transação:", transactionError.message)
        return null
      }

      console.log("✅ Transação registrada com sucesso!")
    }

    // PASSO 3: Verificar status atual
    console.log("\n=== PASSO 3: VERIFICAR STATUS ATUAL ===")

    // Verificar status do depósito
    console.log(`Verificando status do depósito ${depositInfo.id}...`)

    try {
      const statusResponse = await axios.get(`${url_api}/deposit/${depositInfo.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("✅ Status obtido com sucesso!")
      console.log("Resposta:", JSON.stringify(statusResponse.data, null, 2))

      const currentStatus = statusResponse.data.data?.status || "Desconhecido"
      console.log(`Status atual: ${currentStatus}`)
    } catch (statusError: any) {
      console.log("⚠️ Não foi possível verificar o status via API. Usando status do momento da criação.")
      console.log(`Status atual: ${depositInfo.status}`)
    }

    // PASSO 4: Simular webhook de confirmação
    console.log("\n=== PASSO 4: SIMULAR WEBHOOK DE CONFIRMAÇÃO ===")

    // Verificar se o servidor Next.js está rodando
    console.log("Verificando se o servidor Next.js está rodando...")

    try {
      // Tentar acessar a rota de saúde do servidor
      await axios.get("http://localhost:3000/api/health", { timeout: 2000 })
      console.log("✅ Servidor Next.js está rodando!")

      // Simular o webhook
      console.log("\nEnviando webhook simulado...")

      // Simular o payload que a XGate enviaria
      const webhookPayload = {
        event: "deposit.status.updated",
        data: {
          id: depositInfo.id,
          status: "COMPLETED",
          customerId: customerId,
          amount: amount,
          currency: "BRL",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }

      const webhookResponse = await axios.post("http://localhost:3000/api/webhooks/xgate/pix", webhookPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("✅ Webhook enviado com sucesso!")
      console.log("Status da resposta:", webhookResponse.status)
      console.log("Dados da resposta:", webhookResponse.data)

      // Verificar se a transação foi atualizada
      console.log("\nVerificando se a transação foi atualizada...")

      // Aguardar um momento para o processamento do webhook
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const { data: updatedTransaction } = await supabase
        .from("transactions")
        .select("*")
        .eq("reference", depositInfo.id)
        .single()

      if (updatedTransaction.status === "completed") {
        console.log("✅ Transação atualizada com sucesso para 'completed'!")
      } else {
        console.log("⚠️ Transação ainda não foi atualizada. Status atual:", updatedTransaction.status)
      }
    } catch (webhookError: any) {
      console.log("⚠️ Não foi possível simular o webhook. O servidor Next.js pode não estar rodando.")
      console.log("Erro:", webhookError.message)
      console.log("\nPara simular o webhook manualmente:")
      console.log("1. Inicie o servidor Next.js: npm run dev")
      console.log("2. Execute o seguinte comando em outro terminal:")
      console.log(`npx ts-node scripts/simulate-webhook-manual.ts ${depositInfo.id}`)
    }

    return {
      depositId: depositInfo.id,
      pixCode: depositInfo.code,
      status: depositInfo.status,
      customerId,
      userId,
    }
  } catch (error: any) {
    console.error("\n❌ Erro durante o fluxo completo:")

    if (error.response) {
      console.error("Status do erro:", error.response.status)
      console.error("Mensagem:", error.response.data.message || JSON.stringify(error.response.data))
    } else {
      console.error("Erro:", error.message)
    }

    return null
  }
}

// Executar o fluxo completo
console.log("=== FLUXO COMPLETO DE DEPÓSITO PIX ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

runCompleteFlow()
  .then((result) => {
    console.log("\n=== RESUMO FINAL ===")
    if (result) {
      console.log("✅ Fluxo completo executado com sucesso!")
      console.log("ID do depósito:", result.depositId)
      console.log("Código PIX:", result.pixCode)
      console.log("Status inicial:", result.status)
      console.log("\nPróximos passos:")
      console.log("1. Use o código PIX para realizar o pagamento real (se desejar)")
      console.log("2. Quando o pagamento for confirmado, a XGate enviará um webhook real")
      console.log("3. O webhook atualizará o status da transação e o saldo do usuário")
    } else {
      console.log("❌ Falha no fluxo completo. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o fluxo:", err)
    console.error("===============================")
  })

