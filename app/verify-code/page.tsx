"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/api"
import axios from "axios"

export default function VerifyCodePage() {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Obter email dos parâmetros da URL
    const emailParam = searchParams.get("email")
    
    console.log("Email recebido na página de verificação:", emailParam)
    
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // Redirecionar para forgot-password se não houver email
      router.push("/forgot-password")
    }
  }, [searchParams, router])

  // Gerenciar o cooldown para reenviar o código
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    const code = verificationCode.join("")
    
    console.log('Dados para verificação de código:', { 
      email, 
      code: code.replace(/./g, '*') // Oculta o código para segurança
    })
    
    try {
      await authService.verifyCode(email, code)
      
      // Redirecionar para redefinir senha
      router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`)
    } catch (err) {
      console.error("Erro completo ao verificar código:", err)
      
      if (axios.isAxiosError(err)) {
        console.error("Detalhes do erro Axios:", {
          response: err.response,
          request: err.request,
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        })

        // Verificar se há uma mensagem de erro específica
        const errorMessage = err.response?.data?.message || 
                             err.response?.data?.error || 
                             "Código inválido. Tente novamente."
        
        setError(errorMessage)
      } else {
        // Para erros que não são do Axios
        console.error("Erro não Axios:", err)
        setError("Erro ao verificar código. Verifique sua conexão.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    
    setIsLoading(true)
    setError("")
    
    try {
      console.log('Reenviando código para:', email)
      
      await authService.forgotPassword(email)
      setResendCooldown(60) // 60 segundos de espera para reenviar
      
      console.log('Código reenviado com sucesso')
    } catch (err) {
      console.error("Erro completo ao reenviar código:", err)
      
      if (axios.isAxiosError(err)) {
        console.error("Detalhes do erro Axios:", {
          response: err.response,
          request: err.request,
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        })

        // Verificar se há uma mensagem de erro específica
        const errorMessage = err.response?.data?.message || 
                             err.response?.data?.error || 
                             "Erro ao reenviar código."
        
        setError(errorMessage)
      } else {
        // Para erros que não são do Axios
        console.error("Erro não Axios:", err)
        setError("Erro desconhecido ao reenviar código.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    // Permitir apenas dígitos
    if (!/^\d*$/.test(value)) {
      return
    }
    
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  const handleBackspace = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6">
        <div className="mb-6 flex items-center">
          <Link href={`/forgot-password?email=${encodeURIComponent(email)}`} className="text-blue-500 hover:text-blue-600 flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Link>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-medium text-slate-800">Verificar Código</h1>
          <p className="text-slate-500 text-sm mt-1">
            Digite o código de 6 dígitos enviado para {email}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-5">
          <div className="flex justify-center gap-2 my-8">
            {verificationCode.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleBackspace(index, e)}
                className="w-10 h-12 text-center text-lg font-bold bg-white border-slate-300"
                required
                disabled={isLoading}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-500 hover:bg-blue-600"
            disabled={isLoading || verificationCode.some(digit => !digit)}
          >
            {isLoading ? "Verificando..." : "Verificar"}
          </Button>

          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isLoading}
              className={`text-sm ${resendCooldown > 0 ? 'text-slate-400' : 'text-blue-500 hover:text-blue-600'}`}
            >
              {resendCooldown > 0 
                ? `Reenviar código (${resendCooldown}s)` 
                : "Reenviar código"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}