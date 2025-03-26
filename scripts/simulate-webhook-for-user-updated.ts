import axios from "axios"
import { supabase } from "../lib/supabase"

/**
 * Script atualizado para simular um webhook da XGate para um usuário específico
 * Leva em conta a estrutura real da tabela transactions
 */
async function simulateWebhookForUser(depositId: string, userId: string) {
  try {
    // Verificar se o usuário existe
    console.log(`Verificando usuário ${userId}...`)
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("❌ Erro ao verificar usuário:", userError.message)
      return null
    }

    console.log("✅ Usuário encontrado:", userData.name, userData.email)
    console.log("Saldo atual:", userData.real_balance)

    // Verificar se o servidor Next.js está rodando
    console.log("\nVerificando se o servidor Next.js está rodando...")

    try {
      // Tentar acessar a rota de saúde do servidor
      await axios.get("http://localhost:3000/api/health", { timeout: 2000 })
      console.log("✅ Servidor Next.js está rodando!")
    } catch (e) {
      console.error("❌ Servidor Next.js não está rodando ou não tem a rota /api/health")
      console.log("Criando a rota de saúde...")

      console.log("\nPara criar a rota de saúde, adicione o arquivo app/api/health/route.ts com o seguinte conteúdo:")
      console.log(`
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() })
}
      `)

      console.log("\nEm seguida, inicie o servidor Next.js com: npm run dev")
      return null
    }

    // Obter o customerId associado ao usuário
    console.log("\nBuscando mapeamento de cliente...")
    const { data: mappingData, error: mappingError } = await supabase
      .from("xgate_customer_mapping")
      .select("*")
      .eq("user_id", userId)
      .single()

    let customerId = "67de2322bbf0316b4edca8df" // ID padrão

    if (mappingError) {
      console.log("⚠️ Mapeamento não encontrado, usando ID de cliente padrão:", customerId)
    } else {
      customerId = mappingData.customer_id
      console.log("✅ Mapeamento encontrado. ID do cliente:", customerId)
    }

    // Verificar se já existe uma transação para este depósito
    console.log("\nVerificando se já existe uma transação para este depósito...")

    // Primeiro, vamos descobrir a estrutura da tabela transactions
    console.log("Descobrindo a estrutura da tabela transactions...")
    const { data: transactionSample, error: sampleError } = await supabase.from("transactions").select("*").limit(1)

    if (sampleError) {
      console.error("❌ Erro ao verificar estrutura da tabela transactions:", sampleError.message)
      return null
    }

    // Criar uma transação se não existir
    console.log("\nCriando transação para o depósito...")

    // Preparar dados da transação com base na estrutura descoberta
    const transactionData: any = {
      user_id: userId,
      type: "deposit",
      amount: 100,
      status: "pending",
      date: new Date().toISOString(), // Coluna obrigatória que descobrimos
    }

    // Adicionar campos opcionais se existirem na estrutura
    if (transactionSample && transactionSample.length > 0) {
      const sampleKeys = Object.keys(transactionSample[0])

      if (sampleKeys.includes("reference")) {
        transactionData.reference = depositId
      }

      if (sampleKeys.includes("external_id")) {
        transactionData.external_id = depositId
      }

      if (sampleKeys.includes("details")) {
        transactionData.details = {
          id: depositId,
          customerId: customerId,
          status: "WAITING_PAYMENT",
          amount: 100,
          currency: "BRL",
        }
      }

      console.log("Estrutura da tabela transactions:", sampleKeys)
    }

    console.log("Inserindo transação:", transactionData)

    const { error: insertError } = await supabase.from("transactions").insert(transactionData)

    if (insertError) {
      console.error("❌ Erro ao inserir transação:", insertError.message)
      console.log("Continuando mesmo com erro na transação...")
    } else {
      console.log("✅ Transação inserida com sucesso!")
    }

    // Simular o webhook
    console.log("\nEnviando webhook simulado...")

    // URL do webhook
    const webhookUrl = "http://localhost:3000/api/webhooks/xgate/pix"

    // Simular o payload que a XGate enviaria
    const webhookPayload = {
      event: "deposit.status.updated",
      data: {
        id: depositId,
        status: "COMPLETED",
        customerId: customerId,
        amount: 100, // Valor padrão
        currency: "BRL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    console.log("Payload do webhook:", JSON.stringify(webhookPayload, null, 2))

    const webhookResponse = await axios.post(webhookUrl, webhookPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("\n✅ Webhook enviado com sucesso!")
    console.log("Status da resposta:", webhookResponse.status)
    console.log("Dados da resposta:", webhookResponse.data)

    // Verificar se o saldo foi atualizado
    console.log("\nVerificando se o saldo foi atualizado...")

    // Aguardar um momento para o processamento do webhook
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const { data: updatedUserData, error: updatedUserError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (updatedUserError) {
      console.error("❌ Erro ao verificar usuário atualizado:", updatedUserError.message)
      return null
    }

    console.log("Saldo anterior:", userData.real_balance)
    console.log("Saldo atual:", updatedUserData.real_balance)

    if (updatedUserData.real_balance > userData.real_balance) {
      console.log("✅ Saldo atualizado com sucesso!")
    } else {
      console.log("⚠️ Saldo não foi atualizado. Verifique os logs do servidor.")
    }

    return {
      success: true,
      depositId,
      userId,
      oldBalance: userData.real_balance,
      newBalance: updatedUserData.real_balance,
    }
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

// Obter parâmetros da linha de comando
const depositId = process.argv[2]
const userId = process.argv[3] || "7077a227-23ac-48e7-8ed0-2efa43602c6b" // ID do usuário que encontramos

if (!depositId) {
  console.error("❌ Erro: ID do depósito não fornecido!")
  console.error("Uso: npx ts-node scripts/simulate-webhook-for-user-updated.ts ID_DO_DEPOSITO [ID_DO_USUARIO]")
  process.exit(1)
}

// Executar a simulação
console.log("=== SIMULAÇÃO DE WEBHOOK PARA USUÁRIO ESPECÍFICO (ATUALIZADO) ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

simulateWebhookForUser(depositId, userId)
  .then((result) => {
    console.log("\n=== RESUMO ===")
    if (result) {
      console.log("✅ Simulação de webhook concluída com sucesso!")
      console.log("ID do depósito:", result.depositId)
      console.log("ID do usuário:", result.userId)
      console.log("Saldo anterior:", result.oldBalance)
      console.log("Novo saldo:", result.newBalance)
      console.log("\nPróximos passos:")
      console.log("1. Verifique os logs do servidor para confirmar o processamento do webhook")
      console.log("2. Verifique se o saldo do usuário foi atualizado corretamente")
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

