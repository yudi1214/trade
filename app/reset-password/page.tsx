"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/api"
import axios from "axios"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Obter email e código dos parâmetros da URL
    const emailParam = searchParams.get("email")
    const codeParam = searchParams.get("code")
    
    console.log("Email param:", emailParam)
    console.log("Code param:", codeParam)
    
    if (emailParam && codeParam) {
      setEmail(emailParam)
      setCode(codeParam)
    } else {
      // Redirecionar para forgot-password se não houver parâmetros necessários
      router.push("/forgot-password")
    }
  }, [searchParams, router])

  const validatePassword = (password: string): boolean => {
    // Requisitos mínimos: pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    
    if (!minLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setPasswordError(
        "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número."
      )
      return false
    }
    
    setPasswordError("")
    return true
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    // Verificar se as senhas coincidem
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }
    
    // Validar complexidade da senha
    if (!validatePassword(newPassword)) {
      setIsLoading(false)
      return
    }
    
    console.log("Dados para reset:", { 
      email, 
      code, 
      newPassword: newPassword.replace(/./g, '*') // Oculta a senha para segurança
    })
    
    try {
      await authService.resetPassword(email, code, newPassword)
      router.push("/reset-success")
    } catch (err) {
      console.error("Erro ao redefinir senha:", err)
      if (axios.isAxiosError(err)) {
        console.error("Detalhes do erro:", {
          status: err.response?.status,
          data: err.response?.data
        })
        setError(err.response?.data?.message || "Erro ao redefinir senha. Tente novamente.")
      } else {
        setError("Erro desconhecido ao redefinir senha.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6">
        <div className="mb-6 flex items-center">
          <Link 
            href={`/verify-code?email=${encodeURIComponent(email)}`} 
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Link>
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-medium text-slate-800">Nova Senha</h1>
          <p className="text-slate-500 text-sm mt-1">Crie uma nova senha para sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 bg-white border-slate-300 pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 bg-white border-slate-300 pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 mt-2"
            disabled={isLoading || !newPassword || !confirmPassword}
          >
            {isLoading ? "Processando..." : "Redefinir Senha"}
          </Button>
        </form>
      </div>
    </div>
  )
}