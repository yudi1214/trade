"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/lib/api"

interface AuthMiddlewareProps {
  children: ReactNode
}

// Lista de rotas que não precisam de autenticação
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-code",
  "/reset-password",
  "/reset-success"
]

// Altere de export function para export default function
export default function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificar se a rota atual é pública
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}?`)
    )

    // Se for uma rota pública, não precisa verificar autenticação
    if (isPublicRoute) {
      setIsLoading(false)
      return
    }

    // Para rotas protegidas, verificar se o usuário está autenticado
    const isAuthenticated = authService.isAuthenticated()
    
    if (!isAuthenticated) {
      // Redirecionar para o login se não estiver autenticado
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [pathname, router])

  // Exibir um loader enquanto verifica a autenticação
  if (isLoading && !publicRoutes.some(route => pathname === route)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}