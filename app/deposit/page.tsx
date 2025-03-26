"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ProfileNav } from "@/components/profile-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Clock, Copy, CheckCircle2, ChevronDown, ChevronUp, Gift, Tag, ArrowRight, AlertCircle } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Substituir todas as chamadas de toast por alertas
export default function DepositPage() {
  const [amount, setAmount] = useState("100")
  const [selectedBonus, setSelectedBonus] = useState("100")
  const [showQRCode, setShowQRCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showBonusOptions, setShowBonusOptions] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [showPromoField, setShowPromoField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pixCode, setPixCode] = useState("")
  const [depositId, setDepositId] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleCopyPix = () => {
    if (!pixCode) return

    navigator.clipboard
      .writeText(pixCode)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Erro ao copiar: ", err)
        alert("Não foi possível copiar o código PIX")
      })
  }

  const handleGeneratePix = async () => {
    if (!amount || Number(amount) <= 0) {
      setErrorMessage("Por favor, insira um valor válido para o depósito")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          bonus: Number(selectedBonus),
          promoCode: promoCode || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao gerar PIX")
      }

      setPixCode(data.pixCode)
      setDepositId(data.depositId)
      setShowQRCode(true)
    } catch (error) {
      console.error("Erro ao gerar PIX:", error)
      setErrorMessage(error instanceof Error ? error.message : "Ocorreu um erro ao gerar o código PIX")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para gerar QR code SVG a partir do código PIX
  const generateQRCodeSVG = () => {
    // Placeholder para o QR code - em produção, você usaria uma biblioteca real
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-32 h-32 text-gray-300 dark:text-gray-600"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <path d="M8 7H10" />
        <path d="M14 7H16" />
        <path d="M8 12H10" />
        <path d="M8 16H10" />
        <path d="M14 12H16" />
        <path d="M14 16H16" />
      </svg>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <ProfileNav />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6 relative pb-16 md:pb-6">
          {!showQRCode ? (
            <div className="max-w-[800px] mx-auto">
              <Card className="border-2 shadow-sm dark:border-border">
                <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 dark:from-yellow-500/20 dark:to-yellow-500/10 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <svg viewBox="0 0 32 32" className="w-6 h-6 fill-yellow-500">
                      <path d="M24.667 5.333H7.333A2 2 0 0 0 5.333 7.333v17.334a2 2 0 0 0 2 2h17.334a2 2 0 0 0 2-2V7.333a2 2 0 0 0-2-2zm-8.667 14.7h-4.7v-4.7h4.7v4.7zm0-8.066h-4.7V7.333h4.7v4.634zm8.067 8.066H19.4v-4.7h4.667v4.7zm0-8.066H19.4V7.333h4.667v4.634z" />
                    </svg>
                    Depósito via PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Mensagem de erro */}
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                      <span className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errorMessage}
                      </span>
                    </div>
                  )}

                  {/* Valor do depósito - Simplified and prominent */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium">Valor do depósito</label>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Gift className="h-4 w-4" />
                        <span>Bônus ativo: {selectedBonus}%</span>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500">
                        R$
                      </span>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-12 h-14 text-xl font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 200, 500, 1000].map((value) => (
                        <Button
                          key={value}
                          variant={amount === String(value) ? "default" : "outline"}
                          onClick={() => setAmount(String(value))}
                          className="h-12"
                        >
                          R$ {value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bonus options - Hidden by default */}
                  <Collapsible open={showBonusOptions} onOpenChange={setShowBonusOptions}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-between border border-dashed border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-300"
                      >
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5" />
                          <span>Selecionar bônus de depósito</span>
                        </div>
                        {showBonusOptions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                        {[
                          { percentage: "100", maxAmount: "1.000", minDeposit: "50" },
                          { percentage: "200", maxAmount: "2.000", minDeposit: "200" },
                          { percentage: "300", maxAmount: "3.000", minDeposit: "500" },
                        ].map((bonus) => (
                          <Card
                            key={bonus.percentage}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedBonus === bonus.percentage
                                ? "border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                                : "hover:border-yellow-200 dark:hover:border-yellow-900/50"
                            }`}
                            onClick={() => setSelectedBonus(bonus.percentage)}
                          >
                            <CardContent className="pt-6">
                              <div className="mb-2">
                                <span className="font-bold text-lg">{bonus.percentage}% Bônus</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Até R$ {bonus.maxAmount}</p>
                              <p className="text-xs text-muted-foreground mt-1">Mín: R$ {bonus.minDeposit}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Promo code field - Hidden by default */}
                  {!showPromoField ? (
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center gap-2 text-sm"
                      onClick={() => setShowPromoField(true)}
                    >
                      <Tag className="h-4 w-4" />
                      <span>Tenho um código promocional</span>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Código promocional</label>
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Digite seu código"
                      />
                    </div>
                  )}

                  {/* Summary - Simplified */}
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Depósito</span>
                      <span className="font-medium">R$ {amount}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Bônus ({selectedBonus}%)</span>
                      <span className="font-medium text-green-500">
                        +R$ {((Number(amount) * Number(selectedBonus)) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">
                        R$ {(Number(amount) * (1 + Number(selectedBonus) / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-t pt-6">
                  {/* Primary CTA - More prominent */}
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 h-14 text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={handleGeneratePix}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>Gerando PIX...</span>
                      </>
                    ) : (
                      <>
                        <span>Gerar PIX</span>
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Ao clicar em "Gerar PIX", você concorda com nossos termos e condições.
                  </p>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="max-w-[500px] mx-auto">
              <Card className="border-2 shadow-md dark:border-border">
                <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 dark:from-yellow-500/20 dark:to-yellow-500/10 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 32 32" className="w-5 h-5 fill-yellow-500">
                        <path d="M24.667 5.333H7.333A2 2 0 0 0 5.333 7.333v17.334a2 2 0 0 0 2 2h17.334a2 2 0 0 0 2-2V7.333a2 2 0 0 0-2-2zm-8.667 14.7h-4.7v-4.7h4.7v4.7zm0-8.066h-4.7V7.333h4.7v4.634zm8.067 8.066H19.4v-4.7h4.667v4.7zm0-8.066H19.4V7.333h4.667v4.634z" />
                      </svg>
                      Pagamento PIX
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-200 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                      {selectedBonus}% Bônus
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-medium">Valor a pagar</p>
                      <p className="text-3xl font-bold">R$ {amount}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Você receberá R$ {(Number(amount) * (1 + Number(selectedBonus) / 100)).toFixed(2)}
                      </p>
                    </div>

                    <div className="w-64 h-64 bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center border-2 border-yellow-100 dark:border-yellow-900/50">
                      {generateQRCodeSVG()}
                    </div>

                    <div className="w-full">
                      <p className="text-base font-medium mb-2 flex items-center">
                        <Copy className="h-5 w-5 mr-2 text-yellow-500" />
                        Copie o código PIX
                      </p>
                      <div className="relative mb-4">
                        <Input
                          value={pixCode}
                          readOnly
                          className="pr-24 font-mono text-sm bg-gray-50 dark:bg-gray-800"
                        />
                        <Button
                          variant="default"
                          size="sm"
                          className="absolute right-1 top-1 h-7 bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700"
                          onClick={handleCopyPix}
                        >
                          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span className="ml-1">{copied ? "Copiado" : "Copiar"}</span>
                        </Button>
                      </div>

                      {/* Add a prominent copy button for mobile users */}
                      <Button
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium h-12 mb-4 flex items-center justify-center gap-2 shadow-md dark:bg-yellow-600 dark:hover:bg-yellow-700"
                        onClick={handleCopyPix}
                      >
                        {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        <span>{copied ? "Código PIX Copiado!" : "Copiar Código PIX"}</span>
                      </Button>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md w-full">
                        <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        <span>O pagamento será confirmado automaticamente em até 2 minutos</span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md w-full">
                        <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                        <span>ID do depósito: {depositId}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 dark:from-yellow-500/20 dark:to-yellow-500/10 border-t pt-6">
                  <Button variant="outline" className="w-full h-12" onClick={() => setShowQRCode(false)}>
                    Voltar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          <div className="fixed bottom-20 right-4 z-10 md:absolute md:bottom-4">
            <ThemeToggle />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}

