import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { randomBytes } from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email é obrigatório" }, { status: 400 })
    }

    // Verificar se o email existe
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (error || !user) {
      // Por segurança, não informamos se o email existe ou não
      return NextResponse.json({ message: "Se o email estiver cadastrado, você receberá um código de recuperação" })
    }

    // Gerar código de recuperação (6 dígitos)
    const code = randomBytes(3).toString('hex').toUpperCase()

    // Definir expiração (1 hora)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Remover códigos antigos para este email
    await supabase
      .from('reset_codes')
      .delete()
      .eq('email', email)

    // Salvar código no banco
    const { error: insertError } = await supabase
      .from('reset_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error("Erro ao salvar código de recuperação:", insertError)
      return NextResponse.json({ message: "Erro ao processar solicitação" }, { status: 500 })
    }

    // Em produção, enviar email com o código
    console.log(`Código de recuperação para ${email}: ${code}`)

    return NextResponse.json({ message: "Se o email estiver cadastrado, você receberá um código de recuperação" })
  } catch (error) {
    console.error("Erro na recuperação de senha:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}