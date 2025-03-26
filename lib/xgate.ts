// lib/xgate.ts
import axios from "axios"

// Configuração da API do XGate
const xgateApi = axios.create({
  baseURL: "https://api.xgateglobal.com",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.XGATE_API_KEY || "",
  },
})

// Interface para a resposta de criação de cobrança PIX
interface PixChargeResponse {
  id: string
  status: string
  qrcode: string
  qrcodeBase64: string
  copyPaste: string
  expiresAt: string
  amount: number
}

// Interface para a resposta de verificação de status
interface PixStatusResponse {
  id: string
  status: "pending" | "completed" | "expired" | "cancelled"
  paidAt?: string
  amount: number
}

// Interface para a resposta de saque PIX
interface PixWithdrawResponse {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  amount: number
}

export const xgateService = {
  // Criar uma cobrança PIX
  createPixCharge: async (amount: number, userId: string): Promise<PixChargeResponse> => {
    try {
      const response = await xgateApi.post("/pix/charges", {
        amount,
        description: `Depósito via PIX - Usuário ${userId}`,
        expiresIn: 3600, // Expira em 1 hora
        callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/xgate/pix`,
        metadata: {
          userId,
        },
      })
      return response.data
    } catch (error) {
      console.error("Erro ao criar cobrança PIX:", error)
      throw error
    }
  },

  // Verificar o status de uma cobrança PIX
  checkPixStatus: async (chargeId: string): Promise<PixStatusResponse> => {
    try {
      const response = await xgateApi.get(`/pix/charges/${chargeId}`)
      return response.data
    } catch (error) {
      console.error("Erro ao verificar status do PIX:", error)
      throw error
    }
  },

  // Iniciar um saque PIX
  createPixWithdraw: async (
    amount: number,
    userId: string,
    pixKey: string,
    pixKeyType: "cpf" | "cnpj" | "email" | "phone" | "random"
  ): Promise<PixWithdrawResponse> => {
    try {
      const response = await xgateApi.post("/pix/withdrawals", {
        amount,
        description: `Saque via PIX - Usuário ${userId}`,
        pixKey,
        pixKeyType,
        metadata: {
          userId,
        },
      })
      return response.data
    } catch (error) {
      console.error("Erro ao criar saque PIX:", error)
      throw error
    }
  },

  // Verificar o status de um saque PIX
  checkWithdrawStatus: async (withdrawId: string): Promise<PixWithdrawResponse> => {
    try {
      const response = await xgateApi.get(`/pix/withdrawals/${withdrawId}`)
      return response.data
    } catch (error) {
      console.error("Erro ao verificar status do saque:", error)
      throw error
    }
  },
}