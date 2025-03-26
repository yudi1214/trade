import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

// Rota para criar um depósito PIX diretamente (apenas para desenvolvimento)
export async function POST(request: NextRequest) {
  // Em produção, esta rota deve ser desabilitada ou protegida
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Rota disponível apenas em desenvolvimento" }, { status: 403 })
  }

  try {
    // Obter dados da requisição
    const { amount = 100 } = await request.json()

    // Credenciais da XGate
    const email = "maurilioxgate@xgate.com.br"
    const password = "maurilioxgate@123"
    const url_api = "https://api.xgateglobal.com"

    // Autenticar na API XGate
    const login = await axios.post(`${url_api}/auth/token`, { email, password })
    const token = login.data.token

    // Obter moedas disponíveis
    const { data: currencies } = await axios.get(`${url_api}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Encontrar a moeda PIX
    const pixCurrency = currencies.find((c: any) => c.type === "PIX" && c.name === "BRL")

    if (!pixCurrency) {
      return NextResponse.json({ error: "Moeda PIX (BRL) não encontrada" }, { status: 400 })
    }

    // Criar cliente de teste
    const customerData = {
      name: "Cliente Teste API",
      email: "cliente.api@example.com",
      phone: "11999999999",
    }

    let customerId
    try {
      const customerResponse = await axios.post(`${url_api}/customer`, customerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      customerId = customerResponse.data.customer._id
    } catch (error: any) {
      // Se o cliente já existir, tentar extrair o ID do erro
      if (error.response && error.response.status === 409 && error.response.data.customer) {
        customerId = error.response.data.customer._id
      } else {
        throw error
      }
    }

    // Criar depósito PIX
    const depositData = {
      amount,
      customerId,
      currency: pixCurrency._id,
    }

    const depositResponse = await axios.post(`${url_api}/deposit`, depositData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const depositInfo = depositResponse.data.data

    // Retornar informações do depósito
    return NextResponse.json({
      success: true,
      depositId: depositInfo.id,
      pixCode: depositInfo.code,
      status: depositInfo.status,
      amount,
      customerId,
    })
  } catch (error: any) {
    console.error("Erro ao criar depósito:", error)

    // Retornar erro detalhado
    if (error.response) {
      return NextResponse.json(
        {
          error: "Erro na API XGate",
          status: error.response.status,
          message: error.response.data.message || JSON.stringify(error.response.data),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}

