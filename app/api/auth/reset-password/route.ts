import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json()

    if (!email || !code || !password) {
      return NextResponse.json({ message: "Email, código e nova senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Buscar código de recuperação
    const { data: resetCode, error } = await supabase
      .from('reset_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single()

    if (error || !resetCode) {
      return NextResponse.json({ message: "Código inválido ou expirado" }, { status: 400 })
    }

    // Verificar se o código expirou
    const expiresAt = new Date(resetCode.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      return NextResponse.json({ message: "Código expirado" }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await hash(password, 10)

    // Atualizar senha do usuário
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email)

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError)
      return NextResponse.json({ message: "Erro ao atualizar senha" }, { status: 500 })
    }

    // Remover código de recuperação
    await supabase
      .from('reset_codes')
      .delete()
      .eq('email', email)

    return NextResponse.json({ message: "Senha atualizada com sucesso" })
  } catch (error) {
    console.error("Erro na redefinição de senha:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}