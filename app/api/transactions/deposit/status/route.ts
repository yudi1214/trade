import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import axios from "axios"

// Configuração da API XGate
const XGATE_API_URL = "https://api.xgateglobal.com"
const XGATE_EMAIL = process.env.XGATE_EMAIL || "maurilioxgate@xgate.com.br"
const XGATE_PASSWORD = process.env.XGATE_PASSWORD || "maurilioxgate@123"

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

// Handler para verificar status do depósito
async function handleCheckDepositStatus(request: NextRequest, auth: any) {
  try {
    // Obter ID do depósito da URL
    const { searchParams } = new URL(request.url)
    const depositId = searchParams.get("depositId")

    if (!depositId) {
      return NextResponse.json({ message: "ID do depósito não fornecido" }, { status: 400 })
    }

    // Autenticar na XGate
    const token = await authenticateXGate()

    // Verificar status do depósito
    const depositResponse = await axios.get(`${XGATE_API_URL}/deposit/${depositId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const depositInfo = depositResponse.data.data

    // Retornar status do depósito
    return NextResponse.json({
      success: true,
      depositId,
      status: depositInfo.status,
      details: depositInfo,
    })
  } catch (error: any) {
    console.error("Erro ao verificar status do depósito:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error: error.message }, { status: 500 })
  }
}

// Exportar handler protegido com autenticação
export const GET = withAuth(handleCheckDepositStatus)

