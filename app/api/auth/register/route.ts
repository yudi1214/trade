import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { sign } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"

// Variável de ambiente para o JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "seu_jwt_secret_temporario"

export async function POST(request: Request) {
  try {
    console.log("Iniciando processo de registro...")

    const { name, email, password, phone } = await request.json()
    console.log("Dados recebidos:", { name, email, phone })

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    // Verificar se o email já existe
    console.log("Verificando se o email já existe...")
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ message: "Este email já está em uso" }, { status: 409 })
    }

    // Hash da senha
    console.log("Gerando hash da senha...")
    const hashedPassword = await hash(password, 10)

    // Criar novo usuário
    console.log("Criando novo usuário...")
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        phone,
        account_type: "demo",
        real_balance: 0,
        demo_balance: 10000, // Saldo inicial para conta demo
        bonus_balance: 0,
        verified: false,
        kyc_approved: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar usuário:", error)
      return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 })
    }

    // Gerar token JWT
    console.log("Gerando token JWT...")
    const token = sign(
      {
        userId: newUser.id,
        email: newUser.email,
        accountType: newUser.account_type,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Preparar dados do usuário para retorno (sem a senha)
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      accountType: newUser.account_type,
      realBalance: newUser.real_balance,
      demoBalance: newUser.demo_balance,
      bonusBalance: newUser.bonus_balance,
      verified: newUser.verified,
      kycApproved: newUser.kyc_approved,
    }

    console.log("Registro concluído com sucesso")
    return NextResponse.json({ token, user: userData })
  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}