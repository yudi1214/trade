import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import axios from "axios"

// Configuração da API XGate
const XGATE_API_URL = "https://api.xgateglobal.com"
const XGATE_EMAIL = process.env.XGATE_EMAIL || "maurilioxgate@xgate.com.br"
const XGATE_PASSWORD = process.env.XGATE_PASSWORD || "maurilioxgate@123"

// Handler para criar depósito
async function handleCreateDeposit(request: NextRequest, auth?: any) {
  try {
    // Obter dados da requisição
    const { amount, bonus, promoCode } = await request.json()

    // Validar valor
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Valor de depósito inválido" }, { status: 400 })
    }

    // Usar um ID de usuário padrão se auth não estiver disponível
    const userId = auth?.userId || "user-123" // ID de usuário padrão para testes

    console.log(`Criando depósito PIX de R$ ${amount} para o usuário ${userId}`)
    if (bonus) console.log(`Bônus aplicado: ${bonus}%`)
    if (promoCode) console.log(`Código promocional: ${promoCode}`)

    // Autenticar na XGate
    console.log("Autenticando na API XGate...")
    const loginResponse = await axios.post(`${XGATE_API_URL}/auth/token`, {
      email: XGATE_EMAIL,
      password: XGATE_PASSWORD,
    })

    const token = loginResponse.data.token || loginResponse.data.access_token
    console.log("Autenticação bem-sucedida. Token obtido.")

    // Obter moedas disponíveis
    console.log("Buscando detalhes da moeda...")
    const currenciesResponse = await axios.get(`${XGATE_API_URL}/deposit/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const currencies = currenciesResponse.data
    const pixCurrency = currencies.find((c: any) => c.type === "PIX" && c.name === "BRL")

    if (!pixCurrency) {
      return NextResponse.json({ message: "Moeda PIX não disponível" }, { status: 400 })
    }

    console.log("Moeda PIX encontrada:", pixCurrency.name, pixCurrency.symbol)

    // Usar o cliente existente ou criar um novo
    const customerId = "67de2322bbf0316b4edca8df" // ID do cliente que já funciona
    console.log("Usando cliente existente com ID:", customerId)

    // Criar depósito PIX
    console.log("Criando depósito PIX...")
    const depositData = {
      amount,
      customerId,
      currency: pixCurrency,
    }

    console.log("Dados do depósito:", JSON.stringify(depositData, null, 2))

    const depositResponse = await axios.post(`${XGATE_API_URL}/deposit`, depositData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const depositInfo = depositResponse.data.data
    console.log("Depósito criado com sucesso. ID:", depositInfo.id)

    // Opcionalmente, registrar a transação no banco de dados
    try {
      // Registrar na tabela transactions se ela existir
      const { supabase } = await import("@/lib/supabase")

      // Tentar registrar a transação com a estrutura que descobrimos
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "deposit",
        amount,
        status: "pending",
        date: new Date().toISOString(), // Campo obrigatório que descobrimos
        details: depositInfo,
      })

      console.log("Transação registrada no banco de dados")
    } catch (dbError) {
      // Não falhar se não conseguir registrar no banco
      console.log("Aviso: Não foi possível registrar a transação no banco de dados", dbError)
    }

    // Retornar informações do depósito
    return NextResponse.json({
      success: true,
      depositId: depositInfo.id,
      pixCode: depositInfo.code,
      status: depositInfo.status,
      amount: amount,
      bonus: bonus,
    })
  } catch (error: any) {
    console.error("Erro ao criar depósito:", error)

    if (error.response) {
      return NextResponse.json(
        {
          message: "Erro na API XGate",
          error: error.response.data.message || JSON.stringify(error.response.data),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ message: "Erro interno do servidor", error: error.message }, { status: 500 })
  }
}

// Exportar handler protegido com autenticação
// Em desenvolvimento, permitir solicitações sem autenticação
export const POST = process.env.NODE_ENV === "development" ? handleCreateDeposit : withAuth(handleCreateDeposit)

