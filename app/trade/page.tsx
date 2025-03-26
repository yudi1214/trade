"use client"

import type React from "react"

import { Header } from "@/components/header"
import { TradePanel } from "@/components/trade-panel"
import { TradingView } from "@/components/trading-view"
import { Sidebar } from "@/components/sidebar"
import { AssetTabs } from "@/components/asset-tabs"
import { MobileNav } from "@/components/mobile-nav"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Clock, DollarSign, Plus, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { AuthCheck } from "@/components/AuthCheck"

export default function TradeRoom() {
  const [amount, setAmount] = useState("100")
  const [expiration, setExpiration] = useState("1")

  // Removemos o useEffect de verificação de autenticação, pois o AuthCheck já faz isso

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isNaN(Number(value))) {
      setAmount(value)
    }
  }

  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(1, Number(amount) + delta)
    setAmount(newAmount.toString())
  }

  return (
    <AuthCheck>
      <div className="flex flex-col h-screen bg-background">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - visível apenas em desktop */}
          <div className="hidden md:block border-r border-border">
            <Sidebar />
          </div>

          {/* Main content area */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {/* Asset tabs - always visible */}
            <div className="flex-none border-b border-border">
              <AssetTabs />
            </div>

            {/* Trading view - fills remaining space */}
            <div className="flex-1 overflow-hidden">
              <TradingView />
            </div>

            {/* Mobile expiration and buy/sell buttons - fixed at bottom */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 bg-background border-t border-border z-30">
              {/* Expiration selection - simplified design */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Expiração:</span>
                </div>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger className="w-[100px] h-9 border-0 bg-transparent hover:bg-transparent focus:ring-0">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="top" align="end" className="z-50 min-w-[120px]">
                    <SelectItem value="1">1 minuto</SelectItem>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount input with plus/minus buttons - simplified design */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Valor:</span>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-muted"
                    onClick={() => adjustAmount(-10)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="h-9 w-[80px] text-center border-0 bg-transparent focus-visible:ring-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-muted"
                    onClick={() => adjustAmount(10)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Buy/Sell buttons - simplified design */}
              <div className="grid grid-cols-2 gap-3 p-3">
                <Button
                  className="h-11 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl"
                  onClick={() => {
                    /* Handle buy */
                  }}
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Comprar
                </Button>
                <Button
                  className="h-11 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl"
                  onClick={() => {
                    /* Handle sell */
                  }}
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Vender
                </Button>
              </div>
            </div>
          </main>

          {/* Trade Panel - desktop only */}
          <div className="hidden md:block w-[320px] border-l border-border overflow-hidden">
            <TradePanel />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </AuthCheck>
  )
}

