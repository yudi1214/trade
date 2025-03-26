"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AtSign, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/api"
import axios from "axios"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await authService.forgotPassword(email)
      
      // Redireciona para página de verificação de código
      router.push(`/verify-code?email=${encodeURIComponent(email)}`)
    } catch (err) {
      console.error("Erro ao processar recuperação de senha:", err)
      
      if (axios.isAxiosError(err)) {
        // Verifica se o erro é específico de email não encontrado
        if (err.response?.status === 404) {
          setError("Nenhuma conta encontrada com este email.")
        } else {
          setError(err.response?.data?.message || "Erro ao processar recuperação de senha.")
        }
      } else {
        setError("Erro desconhecido. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6">
        <div className="mb-6 flex items-center">
          <Link href="/login" className="text-blue-500 hover:text-blue-600 flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Link>
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <AtSign className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-medium text-slate-800">Esqueceu a Senha?</h1>
          <p className="text-slate-500 text-sm mt-1">
            Digite o email associado à sua conta para recuperar a senha
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="relative">
            <Input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white border-slate-300 pl-10"
              required
              disabled={isLoading}
            />
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Recuperar Senha"}
          </Button>
        </form>
      </div>
    </div>
  )
}