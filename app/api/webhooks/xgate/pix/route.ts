import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import axios from "axios"

// Configuração da API XGate
const XGATE_API_URL = "https://api.xgateglobal.com"
const XGATE_EMAIL = process.env.XGATE_EMAIL || "maurilioxgate@xgate.com.br"
const XGATE_PASSWORD = process.env.XGATE_PASSWORD || "maurilioxgate@123"
// Opcional: Chave secreta para validar webhooks
const WEBHOOK_SECRET = process.env.XGATE_WEBHOOK_SECRET

// Função para autenticar na API XGate
async function authenticateXGate() {
  try {
    const response = await axios.post(`${XGATE_API_URL}/auth/token`, {
      email: XGATE_EMAIL,
      password: XGATE_PASSWORD,
    })

    return response.data.token || response.data.access_token
  } catch (error: any) {
    console.error("Erro na autenticação XGate:", error.message)
    throw new Error("Falha na autenticação com a XGate")
  }
}

// Função para mapear o customerId da XGate para o userId do seu sistema
async function mapCustomerIdToUserId(customerId: string) {
  try {
    console.log(`Buscando mapeamento para customerId: ${customerId}`)
    // Buscar o mapeamento na tabela do Supabase
    const { data, error } = await supabase
      .from("xgate_customer_mapping")
      .select("user_id")
      .eq("customer_id", customerId)
      .single()

    if (error) {
      console.error(`Erro ao buscar mapeamento: ${error.message}`)
      return null
    }

    if (!data) {
      console.error(`Mapeamento não encontrado para customerId: ${customerId}`)
      return null
    }

    console.log(`Mapeamento encontrado: customerId ${customerId} -> userId ${data.user_id}`)
    return data.user_id
  } catch (error) {
    console.error("Erro ao mapear customerId para userId:", error)
    return null
  }
}

// Função para atualizar o saldo do usuário quando o pagamento for confirmado
async function updateUserBalance(userId: string, amount: number) {
  try {
    console.log(`Atualizando saldo do usuário ${userId} com ${amount}`)

    // Obter saldo atual do usuário
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("real_balance")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error(`Erro ao obter saldo do usuário: ${userError.message}`)
      return false
    }

    // Calcular novo saldo
    const currentBalance = userData.real_balance || 0
    const newBalance = currentBalance + amount

    // Atualizar saldo
    const { error: updateError } = await supabase.from("users").update({ real_balance: newBalance }).eq("id", userId)

    if (updateError) {
      console.error(`Erro ao atualizar saldo: ${updateError.message}`)
      return false
    }

    console.log(`Saldo atualizado com sucesso. Novo saldo: ${newBalance}`)
    return true
  } catch (error) {
    console.error("Erro ao atualizar saldo:", error)
    return false
  }
}

// Função para atualizar o status da transação
async function updateTransactionStatus(depositId: string, status: string) {
  try {
    console.log(`Atualizando status da transação ${depositId} para ${status}`)

    // Descobrir a estrutura da tabela transactions
    const { data: transactionSample, error: sampleError } = await supabase.from("transactions").select("*").limit(1)

    if (sampleError) {
      console.error("❌ Erro ao verificar estrutura da tabela transactions:", sampleError.message)
      return false
    }

    if (!transactionSample || transactionSample.length === 0) {
      console.log("⚠️ Não foi possível determinar a estrutura da tabela transactions")
      return false
    }

    const sampleKeys = Object.keys(transactionSample[0])
    console.log("Estrutura da tabela transactions:", sampleKeys)

    // Tentar atualizar usando diferentes possíveis campos de identificação
    let updated = false

    // Tentativa 1: Com coluna 'reference'
    if (sampleKeys.includes("reference")) {
      try {
        const { error: updateError1 } = await supabase
          .from("transactions")
          .update({ status })
          .eq("reference", depositId)

        if (!updateError1) {
          console.log("✅ Transação atualizada com sucesso (usando coluna 'reference')")
          updated = true
        }
      } catch (e) {
        console.log("Erro ao atualizar usando 'reference':", e)
      }
    }

    // Tentativa 2: Com coluna 'external_id'
    if (!updated && sampleKeys.includes("external_id")) {
      try {
        const { error: updateError2 } = await supabase
          .from("transactions")
          .update({ status })
          .eq("external_id", depositId)

        if (!updateError2) {
          console.log("✅ Transação atualizada com sucesso (usando coluna 'external_id')")
          updated = true
        }
      } catch (e) {
        console.log("Erro ao atualizar usando 'external_id':", e)
      }
    }

    // Tentativa 3: Buscar por details->id
    if (!updated && sampleKeys.includes("details")) {
      try {
        const { data: transactions, error: findError } = await supabase
          .from("transactions")
          .select("*")
          .filter("details->id", "eq", depositId)

        if (!findError && transactions && transactions.length > 0) {
          const transactionId = transactions[0].id

          const { error: updateError3 } = await supabase.from("transactions").update({ status }).eq("id", transactionId)

          if (!updateError3) {
            console.log("✅ Transação atualizada com sucesso (usando details->id)")
            updated = true
          }
        }
      } catch (e) {
        console.log("Erro ao atualizar usando 'details->id':", e)
      }
    }

    if (!updated) {
      console.log("⚠️ Não foi possível atualizar o status da transação")
    }

    return updated
  } catch (error) {
    console.error("Erro ao atualizar status da transação:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  console.log("🔔 Webhook recebido em:", new Date().toISOString())

  try {
    // Verificar assinatura do webhook (se configurado)
    if (WEBHOOK_SECRET) {
      const signature = request.headers.get("x-xgate-signature")
      // Implementar verificação de assinatura aqui
      // Se a XGate fornecer um mecanismo de assinatura
    }

    // Obter dados do webhook
    const webhookData = await request.json()

    // Registrar dados do webhook
    console.log("Webhook recebido da XGate:", JSON.stringify(webhookData, null, 2))

    // Registrar o webhook no Supabase para auditoria (se a tabela existir)
    try {
      const { error: logError } = await supabase.from("webhook_logs").insert({
        provider: "xgate",
        event_type: webhookData.event || "unknown",
        payload: webhookData,
        status: "received",
        processed_at: new Date().toISOString(),
      })

      if (logError) {
        console.error(`Erro ao registrar webhook: ${logError.message}`)
      }
    } catch (e) {
      console.log("Erro ao registrar webhook (tabela webhook_logs pode não existir):", e)
    }

    // Verificar se é uma atualização de status de depósito
    if (webhookData.event === "deposit.status.updated") {
      const depositId = webhookData.data.id
      const status = webhookData.data.status
      const customerId = webhookData.data.customerId
      const amount = webhookData.data.amount

      console.log(`Webhook recebido: Depósito ${depositId} com status ${status}`)

      // Atualizar saldo do usuário se o pagamento foi confirmado
      if (status === "COMPLETED" || status === "CONFIRMED") {
        // 1. Mapear o customerId para userId
        const userId = await mapCustomerIdToUserId(customerId)

        if (!userId) {
          console.error(`Não foi possível mapear o customerId ${customerId} para um userId`)
          return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 404 })
        }

        // 2. Atualizar o status da transação no Supabase
        const transactionUpdated = await updateTransactionStatus(depositId, "completed")

        if (!transactionUpdated) {
          console.log("⚠️ Não foi possível atualizar o status da transação, mas continuando...")
        }

        // 3. Atualizar o saldo do usuário
        const balanceUpdated = await updateUserBalance(userId, amount)

        if (balanceUpdated) {
          console.log(`Saldo do usuário ${userId} atualizado com ${amount}`)

          // 4. Atualizar o status do webhook para "processed" (se a tabela existir)
          try {
            await supabase
              .from("webhook_logs")
              .update({ status: "processed" })
              .eq("payload->data->id", depositId)
              .eq("event_type", "deposit.status.updated")
          } catch (e) {
            console.log("Erro ao atualizar status do webhook (tabela pode não existir):", e)
          }

          return NextResponse.json({ success: true, message: "Saldo atualizado com sucesso" })
        } else {
          console.log(`Falha ao atualizar saldo para o depósito ${depositId}`)

          // Atualizar o status do webhook para "failed" (se a tabela existir)
          try {
            await supabase
              .from("webhook_logs")
              .update({ status: "failed" })
              .eq("payload->data->id", depositId)
              .eq("event_type", "deposit.status.updated")
          } catch (e) {
            console.log("Erro ao atualizar status do webhook (tabela pode não existir):", e)
          }

          return NextResponse.json({ success: false, message: "Falha ao atualizar saldo" }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, message: "Status atualizado, aguardando confirmação" })
    }

    // Para outros tipos de eventos
    return NextResponse.json({ success: true, message: "Evento não processado" })
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error: error.message }, { status: 500 })
  }
}

