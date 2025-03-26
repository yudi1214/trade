"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { authService } from "../../lib/api"
import axios from "axios"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await authService.login(email, password)
      router.push("/dashboard")
    } catch (err) {
      console.error("Erro ao fazer login:", err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.")
      } else {
        setError("Erro desconhecido ao fazer login.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-slate-800">Acessar Conta</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white border-slate-300"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-white border-slate-300 pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600">
            Esqueceu sua senha?
          </Link>
          <div className="text-slate-600 text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}