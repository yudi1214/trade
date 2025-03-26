import axios, { type AxiosError } from "axios"

const api = axios.create({
  baseURL: "/api", // Modificado para apontar para as API Routes do Next.js
  headers: {
    "Content-Type": "application/json",
  },
})

// Log de requisições e adição de token
api.interceptors.request.use(
  (config) => {
    console.log(`📤 Enviando requisição: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    // Verificação segura para ambiente de navegador
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    console.error("❌ Erro ao enviar requisição:", error)
    return Promise.reject(error)
  },
)

// Log de respostas e tratamento de erros - MODIFICADO para não deslogar em erros 401
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Resposta recebida: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(`❌ Erro na resposta: ${error.response.status}`, error.response.data)

      // Não fazemos mais o logout automático em erros 401
      // Esta é a mudança mais importante para resolver o problema de deslogamento
    } else if (error.request) {
      console.error("❌ Sem resposta do servidor:", error.request)
      // Sem resposta do servidor (rede offline, servidor indisponível)
      return Promise.reject({
        response: {
          data: {
            message: "Não foi possível conectar ao servidor. Verifique sua conexão de internet.",
          },
        },
      })
    } else {
      console.error("❌ Erro:", error.message)
    }
    return Promise.reject(error)
  },
)

// Tipos para melhor tipagem
interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  accountType: "real" | "demo" | "vip"
  realBalance: number
  demoBalance: number
  bonusBalance: number
  document?: string
  verified: boolean
  kycApproved: boolean
}

interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "trade"
  amount: number
  date: string
  status: "pending" | "completed" | "failed"
}

// Interface para operações de trading
interface Trade {
  id: string
  userId: string
  symbol: string
  type: "buy" | "sell"
  amount: number
  entryPrice: number
  exitPrice: number | null
  possibleProfit: number
  profit: number
  expiration: number
  status: "open" | "closed"
  result: "win" | "loss" | null
  createdAt: string
  closedAt: string | null
  accountType: string
}

// Interface para os dados do usuário
interface UserData {
  id?: string
  userId?: string
  name?: string
  email?: string
  accountType?: string
  realBalance?: number
  demoBalance?: number
  bonusBalance?: number
  verified?: boolean
  kycApproved?: boolean
  [key: string]: unknown // Para permitir propriedades adicionais
}

// Funções para gerenciar a sessão do usuário
const setUserSession = (token: string, userData: UserData): void => {
  localStorage.setItem("token", token)
  localStorage.setItem("userId", String(userData.id || userData.userId || ""))
  localStorage.setItem("userData", JSON.stringify(userData))
}

const getUserData = (): UserData | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("userData")
  if (!userData) return null

  try {
    return JSON.parse(userData) as UserData
  } catch (error) {
    console.error("Erro ao analisar dados do usuário:", error)
    return null
  }
}

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      if (response.data.token) {
        // Modificado para usar a função setUserSession
        setUserSession(response.data.token, response.data.user || response.data)
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw {
            ...error,
            response: {
              ...error.response,
              data: {
                message: error.response.data.message || "Email ou senha incorretos",
              },
            },
          }
        }
      }
      throw error
    }
  },

  register: async (name: string, phone: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/register", { name, phone, email, password })
      if (response.data.token) {
        // Modificado para usar a função setUserSession
        setUserSession(response.data.token, response.data.user || response.data)
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw {
            ...error,
            response: {
              ...error.response,
              data: {
                message: error.response.data.message || "Este email já está em uso",
              },
            },
          }
        }
      }
      throw error
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw {
            ...error,
            response: {
              ...error.response,
              data: {
                message: error.response.data.message || "Email não encontrado no sistema",
              },
            },
          }
        }
      }
      throw error
    }
  },

  verifyCode: async (email: string, code: string) => {
    try {
      const response = await api.post("/auth/verify-reset-code", { email, code })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw {
            ...error,
            response: {
              ...error.response,
              data: {
                message: error.response.data.message || "Código inválido ou expirado",
              },
            },
          }
        }
      }
      throw error
    }
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        code,
        password: newPassword,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao redefinir senha",
            },
          },
        }
      }
      throw error
    }
  },

  checkEmailExists: async (email: string) => {
    try {
      const response = await api.post("/auth/check-email", { email })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw {
            ...error,
            response: {
              ...error.response,
              data: {
                message: error.response.data.message || "Email não encontrado no sistema",
              },
            },
          }
        }
      }
      throw error
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("userData")
      // Redirecionar para a página de login
      window.location.href = "/login"
    }
  },

  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token")
    }
    return false
  },

  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  },

  // Obter ID do usuário do localStorage
  getUserId: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userId")
    }
    return null
  },

  // Obter dados do usuário
  getUserData,
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get("/user/profile")
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao buscar perfil",
            },
          },
        }
      }
      throw error
    }
  },

  updateProfile: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.put("/user/profile", userData)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao atualizar perfil",
            },
          },
        }
      }
      throw error
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await api.post("/user/change-password", {
        currentPassword,
        newPassword,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao alterar senha",
            },
          },
        }
      }
      throw error
    }
  },

  uploadDocument: async (file: File): Promise<{ message: string; documentPath: string }> => {
    try {
      const formData = new FormData()
      formData.append("document", file)

      const response = await api.post("/user/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro no upload do documento",
            },
          },
        }
      }
      throw error
    }
  },
}

export const transactionService = {
  getTransactions: async (
    page = 1,
    limit = 10,
  ): Promise<{
    transactions: Transaction[]
    total: number
    page: number
    totalPages: number
  }> => {
    try {
      const response = await api.get("/transactions", {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao buscar transações",
            },
          },
        }
      }
      throw error
    }
  },

  createDeposit: async (amount: number, method: "pix" | "bank_transfer"): Promise<Transaction> => {
    try {
      const response = await api.post("/transactions/deposit", {
        amount,
        method,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao criar depósito",
            },
          },
        }
      }
      throw error
    }
  },

  createWithdrawal: async (
    amount: number,
    bankDetails: {
      bank: string
      agency: string
      account: string
    },
  ): Promise<Transaction> => {
    try {
      const response = await api.post("/transactions/withdraw", {
        amount,
        ...bankDetails,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao criar saque",
            },
          },
        }
      }
      throw error
    }
  },
}

// Serviço para operações de trading
export const tradeService = {
  // Obter operações do usuário
  getTrades: async (
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: Trade[]
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }> => {
    try {
      const response = await api.get("/trades", {
        params: { status, page, limit },
      })
      return response.data
    } catch (error) {
      // Não permitimos que erros 401 causem logout
      console.error("Erro ao buscar operações:", error)
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao buscar operações",
            },
          },
        }
      }
      throw error
    }
  },

  // Criar uma operação
  createTrade: async (
    symbol: string,
    type: "buy" | "sell",
    amount: number,
    expiration: number,
    currentPrice: number,
  ): Promise<{
    success: boolean
    data: Trade
  }> => {
    try {
      const response = await api.post("/trades", {
        symbol,
        type,
        amount,
        expiration,
        currentPrice,
      })
      return response.data
    } catch (error) {
      // Não permitimos que erros 401 causem logout
      console.error("Erro ao criar operação:", error)
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao criar operação",
            },
          },
        }
      }
      throw error
    }
  },

  // Finalizar uma operação
  finishTrade: async (
    tradeId: string,
    finalPrice: number,
  ): Promise<{
    success: boolean
    data: Trade
  }> => {
    try {
      const response = await api.post("/trades/finish", {
        tradeId,
        finalPrice,
      })
      return response.data
    } catch (error) {
      // Não permitimos que erros 401 causem logout
      console.error("Erro ao finalizar operação:", error)
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao finalizar operação",
            },
          },
        }
      }
      throw error
    }
  },

  // Obter detalhes de uma operação
  getTradeById: async (
    id: string,
  ): Promise<{
    success: boolean
    data: Trade
  }> => {
    try {
      const response = await api.get(`/trades/${id}`)
      return response.data
    } catch (error) {
      // Não permitimos que erros 401 causem logout
      console.error(`Erro ao buscar operação ${id}:`, error)
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao buscar operação",
            },
          },
        }
      }
      throw error
    }
  },

  // Verificar operações expiradas (apenas para admin/sistema)
  checkExpiredTrades: async (
    prices: Record<string, number>,
  ): Promise<{
    success: boolean
    processed: number
    results: Array<{
      tradeId: string
      result: "win" | "loss"
      entryPrice: number
      exitPrice: number
    }>
  }> => {
    try {
      const response = await api.post("/trades/check-expired", { prices })
      return response.data
    } catch (error) {
      // Não permitimos que erros 401 causem logout
      console.error("Erro ao verificar operações expiradas:", error)
      if (axios.isAxiosError(error)) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              message: error.response?.data?.message || "Erro ao verificar operações expiradas",
            },
          },
        }
      }
      throw error
    }
  },
}

// Serviço específico para o componente TradePanel
export const tradeServices = {
  // Interface para os dados do trade
  createTrade: async (tradeData: {
    userId: string
    assetSymbol: string
    amount: number
    direction: "UP" | "DOWN"
    expirationMinutes: number
  }) => {
    try {
      // Adaptando para a API existente
      const response = await api.post("/trades", {
        symbol: tradeData.assetSymbol,
        type: tradeData.direction === "UP" ? "buy" : "sell",
        amount: tradeData.amount,
        expiration: tradeData.expirationMinutes,
        currentPrice: 0, // Este valor deve ser obtido de outro lugar na sua aplicação
      })

      return response.data.data
    } catch (error) {
      console.error("Erro ao criar trade:", error)
      // Não permitimos que erros 401 causem logout
      throw error
    }
  },

  // Função para obter os trades de um usuário
  getUserTrades: async (userId: string) => {
    try {
      const response = await api.get(`/trades?userId=${userId}`)
      return response.data.data || []
    } catch (error) {
      console.error("Erro ao buscar trades do usuário:", error)
      // Não permitimos que erros 401 causem logout
      throw error
    }
  },
}

export default api

