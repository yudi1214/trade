"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authService } from "../../lib/api"
import axios from "axios"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await authService.register(name, phone, email, password)
      router.push("/login")
    } catch (err) {
      console.error("Erro ao registrar:", err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Erro ao criar conta. Tente novamente.")
      } else {
        setError("Erro desconhecido ao criar conta.")
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
          <h1 className="text-2xl font-medium text-slate-800">Criar Conta</h1>
          <p className="text-slate-500 text-sm mt-1">Preencha os dados para se registrar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-white border-slate-300"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Input
              type="tel"
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 bg-white border-slate-300"
              required
              disabled={isLoading}
            />
          </div>

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
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-slate-600 text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}