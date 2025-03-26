"use client"

import { ReactNode, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/api"

interface PaginaPadraoProps {
  children: ReactNode
}

export default function PaginaPadrao({ children }: PaginaPadraoProps) {
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticação em todas as páginas
    if (!authService.isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      <MobileNav />
    </div>
  )
}