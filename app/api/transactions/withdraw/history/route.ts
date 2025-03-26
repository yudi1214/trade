import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// Handler para obter histórico de saques
async function handleGetWithdrawHistory(request: NextRequest, auth: any) {
  try {
    // Usar um ID de usuário padrão se auth não estiver disponível
    const userId = auth?.userId || "user-123" // ID de usuário padrão para testes

    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

    console.log(`Buscando histórico de saques para o usuário ${userId}`)

    // Buscar transações de saque do usuário
    const {
      data: withdrawals,
      error,
      count,
    } = await supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("type", "withdraw")
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Erro ao buscar histórico de saques:", error.message)
      return NextResponse.json({ message: "Erro ao buscar histórico de saques" }, { status: 500 })
    }

    // Formatar os dados para o frontend
    const formattedWithdrawals = withdrawals.map((withdrawal) => {
      return {
        id: withdrawal.id,
        date: new Date(withdrawal.date).toLocaleDateString("pt-BR"),
        amount: withdrawal.amount,
        method: "PIX",
        status: mapStatus(withdrawal.status),
      }
    })

    return NextResponse.json({
      success: true,
      withdrawals: formattedWithdrawals,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Erro ao buscar histórico de saques:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error: error.message }, { status: 500 })
  }
}

// Função para mapear status do banco de dados para o formato do frontend
function mapStatus(status: string): "Concluído" | "Em análise" | "Cancelado" {
  switch (status.toLowerCase()) {
    case "completed":
      return "Concluído"
    case "pending":
      return "Em análise"
    case "cancelled":
    case "canceled":
      return "Cancelado"
    default:
      return "Em análise"
  }
}

// Exportar handler protegido com autenticação
export const GET =
  process.env.NODE_ENV === "development" ? handleGetWithdrawHistory : withAuth(handleGetWithdrawHistory)

