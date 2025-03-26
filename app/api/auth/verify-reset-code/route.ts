import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ message: "Email e código são obrigatórios" }, { status: 400 })
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

    return NextResponse.json({ message: "Código verificado com sucesso", valid: true })
  } catch (error) {
    console.error("Erro na verificação do código:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}