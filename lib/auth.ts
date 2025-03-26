import { verify } from "jsonwebtoken"
import { supabase } from "./supabase"
import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "seu_jwt_secret_temporario"

interface DecodedToken {
  userId: string
  email: string
  accountType: string
  name?: string
  phone?: string
  document?: string
  iat: number
  exp: number
}

export async function verifyAuth(request: Request) {
  try {
    // Obter token do cabeçalho Authorization
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { isAuthenticated: false }
    }

    const token = authHeader.split(" ")[1]

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as DecodedToken

    // Verificar se o usuário existe
    const { data: user, error } = await supabase.from("users").select("id").eq("id", decoded.userId).single()

    if (error || !user) {
      return { isAuthenticated: false }
    }

    return {
      isAuthenticated: true,
      userId: decoded.userId,
      email: decoded.email,
      accountType: decoded.accountType,
      name: decoded.name,
      phone: decoded.phone,
      document: decoded.document,
    }
  } catch (error) {
    console.error("Erro na verificação de autenticação:", error)
    return { isAuthenticated: false }
  }
}

// Middleware para proteger rotas
export function withAuth(handler: Function) {
  return async (request: Request) => {
    const auth = await verifyAuth(request)

    if (!auth.isAuthenticated) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    return handler(request, auth)
  }
}

// Nova função para verificar token JWT (compatível com a implementação anterior)
export async function verifyJwtToken(token: string) {
  try {
    // Verificar token
    const decoded = verify(token, JWT_SECRET) as DecodedToken

    // Retornar payload decodificado
    return {
      userId: decoded.userId,
      email: decoded.email,
      accountType: decoded.accountType,
      name: decoded.name,
      phone: decoded.phone,
      document: decoded.document,
    }
  } catch (error) {
    console.error("Erro na verificação do token:", error)
    return null
  }
}

// Função para obter usuário a partir do token JWT em uma requisição
export async function getUserFromRequest(request: NextRequest | Request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.split(" ")[1]
  return await verifyJwtToken(token)
}

