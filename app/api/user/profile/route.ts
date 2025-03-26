import { NextResponse } from "next/server"
import { verifyAuth, withAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// Obter perfil do usuário
async function handleGet(request: Request, auth: any) {
  try {
    // Buscar dados completos do usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, account_type, real_balance, demo_balance, bonus_balance, verified, kyc_approved, document')
      .eq('id', auth.userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    // Formatar dados do usuário
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      document: user.document,
      accountType: user.account_type,
      realBalance: user.real_balance,
      demoBalance: user.demo_balance,
      bonusBalance: user.bonus_balance,
      verified: user.verified,
      kycApproved: user.kyc_approved,
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

// Atualizar perfil do usuário
async function handlePut(request: Request, auth: any) {
  try {
    const { name, phone, document } = await request.json()

    // Validação básica
    if (!name) {
      return NextResponse.json({ message: "Nome é obrigatório" }, { status: 400 })
    }

    // Atualizar dados do usuário
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name,
        phone,
        document,
      })
      .eq('id', auth.userId)
      .select('id, name, email, phone, account_type, real_balance, demo_balance, bonus_balance, verified, kyc_approved, document')
      .single()

    if (error) {
      console.error("Erro ao atualizar perfil:", error)
      return NextResponse.json({ message: "Erro ao atualizar perfil" }, { status: 500 })
    }

    // Formatar dados do usuário
    const userData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      document: updatedUser.document,
      accountType: updatedUser.account_type,
      realBalance: updatedUser.real_balance,
      demoBalance: updatedUser.demo_balance,
      bonusBalance: updatedUser.bonus_balance,
      verified: updatedUser.verified,
      kycApproved: updatedUser.kyc_approved,
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

export const GET = withAuth(handleGet)
export const PUT = withAuth(handlePut)