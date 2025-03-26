"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Moon, Sun, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { LogoutButton } from "@/components/LogoutButton"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [showBalances, setShowBalances] = useState(false)

  return (
    <header className="border-b px-4 h-16 flex items-center justify-between sticky top-0 z-40 bg-background">
      {/* Versão mobile do header */}
      <div className="flex items-center justify-between w-full md:hidden">
        {/* Saldo no lado esquerdo com design profissional */}
        <div>
          <Button
            variant="ghost"
            className="p-0 h-auto flex items-center gap-2 hover:bg-transparent"
            onClick={() => setShowBalances(!showBalances)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <div className="flex items-center">
                <span className="font-bold text-lg mr-1">$10000.00</span>
                {showBalances ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </Button>

          {showBalances && (
            <div className="absolute top-16 left-0 w-[220px] bg-background border rounded-md shadow-md p-2">
              <div className="font-medium text-sm mb-2 text-muted-foreground">Seus saldos</div>
              <div className="p-3 mb-2 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="font-medium">Demo</span>
                  </div>
                  <span className="font-bold">$10000.00</span>
                </div>
              </div>
              <div className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="font-medium">Real</span>
                  </div>
                  <span className="font-bold">$5000.00</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botões no lado direito */}
        <div className="flex items-center gap-3">
          {/* Botão de tema */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full h-10 w-10 border-muted-foreground/20"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Botão de depósito */}
          <Link href="/deposit">
            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold h-10 px-4 text-base rounded-md border border-green-500 dark:border-green-700">
              <Wallet className="h-5 w-5 mr-2" />
              Depositar
            </Button>
          </Link>

          {/* Botão de logout (novo) */}
          <LogoutButton variant="ghost" size="sm" className="h-10 px-2 text-muted-foreground hover:text-foreground" />
        </div>
      </div>

      {/* Versão desktop do header */}
      <div className="hidden md:flex md:items-center md:justify-between md:w-full">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">UltimateTrader</h1>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/deposit">
            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold h-10 px-6 text-base rounded-md border border-green-500 dark:border-green-700">
              <Wallet className="h-5 w-5 mr-2" />
              Depositar
            </Button>
          </Link>

          <Button variant="ghost" className="border p-2 h-auto flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">$10000.00</span>
                <span className="text-xs text-muted-foreground uppercase">Demo</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>

          {/* Botão de logout (novo) */}
          <LogoutButton variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
        </div>
      </div>
    </header>
  )
}

