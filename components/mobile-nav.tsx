"use client"

import { Home, User, BarChart2, FileText, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface MobileNavProps {
  onTradeClick?: () => void
}

export function MobileNav({ onTradeClick }: MobileNavProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background">
      <Link
        href="/"
        className={`flex flex-1 flex-col items-center justify-center h-full ${
          isActive("/") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="mt-1 text-xs">Home</span>
      </Link>

      <Link
        href="/trade"
        className={`flex flex-1 flex-col items-center justify-center h-full ${
          isActive("/trade") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <BarChart2 className="h-5 w-5" />
        <span className="mt-1 text-xs">Trade</span>
      </Link>

      <Link
        href="/transactions"
        className={`flex flex-1 flex-col items-center justify-center h-full ${
          isActive("/transactions") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <FileText className="h-5 w-5" />
        <span className="mt-1 text-xs">Transações</span>
      </Link>

      <Link
        href="/profile"
        className={`flex flex-1 flex-col items-center justify-center h-full ${
          isActive("/profile") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <User className="h-5 w-5" />
        <span className="mt-1 text-xs">Perfil</span>
      </Link>

      <Link
        href="/more"
        className={`flex flex-1 flex-col items-center justify-center h-full ${
          isActive("/more") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <MoreHorizontal className="h-5 w-5" />
        <span className="mt-1 text-xs">Mais</span>
      </Link>
    </div>
  )
}

