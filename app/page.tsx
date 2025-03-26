'use client';

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/api'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a página
    const checkAuthStatus = () => {
      // Verifica se há um token válido
      if (authService.isAuthenticated()) {
        // Redireciona para o dashboard se autenticado
        router.push('/dashboard')
      } else {
        // Redireciona para o login se não estiver autenticado
        router.push('/login')
      }
    }

    checkAuthStatus()
  }, [router])

  // Renderiza um indicador de carregamento enquanto verifica a autenticação
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Verificando autenticação...</p>
      </div>
    </div>
  )
}