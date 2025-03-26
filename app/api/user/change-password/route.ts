import { NextResponse } from "next/server"
import { compare, hash } from "bcrypt"
import { verifyAuth, withAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

async function handler(request: Request, auth: any) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Buscar usuário com senha
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', auth.userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar senha atual
    const isPasswordValid = await compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Senha atual incorreta" }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await hash(newPassword, 10)

    // Atualizar senha
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', auth.userId)

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError)
      return NextResponse.json({ message: "Erro ao atualizar senha" }, { status: 500 })
    }

    return NextResponse.json({ message: "Senha atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

export const POST = withAuth(handler)