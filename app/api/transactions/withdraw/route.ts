import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import axios from "axios"
import { supabase } from "@/lib/supabase"

// Configuração da API XGate
const XGATE_API_URL = "https://api.xgateglobal.com"
const XGATE_EMAIL = process.env.XGATE_EMAIL || "maurilioxgate@xgate.com.br"
const XGATE_PASSWORD = process.env.XGATE_PASSWORD || "maurilioxgate@123"

// Handler para criar solicitação de saque
async function handleCreateWithdraw(request: NextRequest, auth: any) {
  try {
    // Obter dados da requisição
    const { amount, pixKeyType, pixKey } = await request.json()

    // Validar valor
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Valor de saque inválido" }, { status: 400 })
    }

    // Validar chave PIX
    if (!pixKey || !pixKeyType) {
      return NextResponse.json({ message: "Chave PIX e tipo são obrigatórios" }, { status: 400 })
    }

    // Usar um ID de usuário padrão se auth não estiver disponível
    const userId = auth?.userId || "user-123" // ID de usuário padrão para testes

    console.log(`Criando solicitação de saque de R$ ${amount} para o usuário ${userId}`)
    console.log(`Tipo de chave PIX: ${pixKeyType}, Chave: ${pixKey}`)

    // Autenticar na XGate
    console.log("Autenticando na API XGate...")
    const loginResponse = await axios.post(`${XGATE_API_URL}/auth/token`, {
      email: XGATE_EMAIL,
      password: XGATE_PASSWORD,
    })

    const token = loginResponse.data.token || loginResponse.data.access_token
    console.log("Autenticação bem-sucedida. Token obtido.")

    // Obter moedas disponíveis para saque
    console.log("Buscando moedas disponíveis para saque...")
    const currenciesResponse = await axios.get(`${XGATE_API_URL}/withdraw/company/currencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const currencies = currenciesResponse.data
    const pixCurrency = currencies.find((c: any) => c.type === "PIX" && c.name === "BRL")

    if (!pixCurrency) {
      return NextResponse.json({ message: "Moeda PIX não disponível para saque" }, { status: 400 })
    }

    console.log("Moeda PIX encontrada:", pixCurrency.name, pixCurrency.symbol)

    // Usar o cliente existente ou criar um novo
    const customerId = "67de2322bbf0316b4edca8df" // ID do cliente que já funciona
    console.log("Usando cliente existente com ID:", customerId)

    // Mapear o tipo de chave PIX para o formato esperado pela API XGate
    const pixKeyTypeMap: Record<string, string> = {
      cpf: "CPF",
      email: "EMAIL",
      phone: "PHONE",
      random: "EVP",
    }

    // Formatar a chave PIX conforme o tipo
    let formattedPixKey = pixKey
    if (pixKeyType === "cpf") {
      // Remover formatação do CPF
      formattedPixKey = pixKey.replace(/\D/g, "")
    } else if (pixKeyType === "phone") {
      // Remover formatação do telefone
      formattedPixKey = pixKey.replace(/\D/g, "")
    }

    // Criar objeto de chave PIX
    const pixKeyObject = {
      key: formattedPixKey,
      type: pixKeyTypeMap[pixKeyType] || pixKeyType.toUpperCase(),
      _id: `temp_${Date.now()}`,
    }

    // Criar solicitação de saque
    console.log("Criando solicitação de saque...")
    const withdrawData = {
      amount,
      customerId,
      currency: pixCurrency,
      pixKey: pixKeyObject,
    }

    console.log("Dados do saque:", JSON.stringify(withdrawData, null, 2))

    const withdrawResponse = await axios.post(`${XGATE_API_URL}/withdraw`, withdrawData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const withdrawInfo = withdrawResponse.data.data || withdrawResponse.data
    console.log("Solicitação de saque criada com sucesso. ID:", withdrawInfo.id)

    // Registrar a transação no banco de dados
    try {
      // Registrar na tabela transactions
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "withdraw",
        amount,
        status: "pending",
        date: new Date().toISOString(),
        details: {
          ...withdrawInfo,
          pixKey: pixKey,
          pixKeyType: pixKeyType,
        },
        reference: withdrawInfo.id,
      })

      if (transactionError) {
        console.error("Erro ao registrar transação:", transactionError.message)
      } else {
        console.log("Transação registrada no banco de dados")
      }
    } catch (dbError) {
      // Não falhar se não conseguir registrar no banco
      console.log("Aviso: Não foi possível registrar a transação no banco de dados", dbError)
    }

    // Retornar informações do saque
    return NextResponse.json({
      success: true,
      withdrawId: withdrawInfo.id,
      status: withdrawInfo.status || "PENDING",
      amount: amount,
      message: "Solicitação de saque realizada com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao criar solicitação de saque:", error)

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
export const POST = process.env.NODE_ENV === "development" ? handleCreateWithdraw : withAuth(handleCreateWithdraw)

