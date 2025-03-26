import { NextResponse } from "next/server"
import { compare } from "bcrypt"
import { sign } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"

// Variável de ambiente para o JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "seu_jwt_secret_temporario"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validação básica
    if (!email || !password) {
      return NextResponse.json({ message: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Buscar usuário pelo email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ message: "Email ou senha incorretos" }, { status: 401 })
    }

    // Verificar senha
    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Email ou senha incorretos" }, { status: 401 })
    }

    // Gerar token JWT
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        accountType: user.account_type,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Preparar dados do usuário para retorno (sem a senha)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.account_type,
      realBalance: user.real_balance,
      demoBalance: user.demo_balance,
      bonusBalance: user.bonus_balance,
      verified: user.verified,
      kycApproved: user.kyc_approved,
    }

    return NextResponse.json({ token, user: userData })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}