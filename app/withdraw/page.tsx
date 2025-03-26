"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ProfileNav } from "@/components/profile-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowRight, AlertCircle, CheckCircle, Wallet } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface RecentWithdrawal {
  amount: number | string
  method: string
  date: string
  status: string
}

const RECENT_WITHDRAWALS: RecentWithdrawal[] = [
  {
    amount: "120,00",
    method: "PIX",
    date: "22/08/2024",
    status: "Concluído",
  },
  {
    amount: "350,00",
    method: "PIX",
    date: "18/08/2024",
    status: "Em análise",
  },
  {
    amount: "80,00",
    method: "PIX",
    date: "10/08/2024",
    status: "Concluído",
  },
]

export default function WithdrawPage() {
  const [amount, setAmount] = useState("100")
  const [pixKeyType, setPixKeyType] = useState("CPF")
  const [pixKey, setPixKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [withdrawId, setWithdrawId] = useState("")
  const [withdrawStatus, setWithdrawStatus] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [recentWithdrawals, setRecentWithdrawals] = useState<RecentWithdrawal[]>(RECENT_WITHDRAWALS)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      setErrorMessage("Por favor, insira um valor válido para o saque")
      return
    }

    if (!pixKey) {
      setErrorMessage("Por favor, insira uma chave PIX válida")
      return
    }

    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const response = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          pixKey: {
            key: pixKey,
            type: pixKeyType,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao processar solicitação de saque")
      }

      setWithdrawId(data.withdrawId)
      setWithdrawStatus(data.status)
      setSuccessMessage(data.message || "Solicitação de saque realizada com sucesso")
      setShowConfirmation(true)
    } catch (error) {
      console.error("Erro ao processar saque:", error)
      setErrorMessage(error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação de saque")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  const handlePixKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    if (pixKeyType === "CPF") {
      value = formatCPF(value)
    } else if (pixKeyType === "CNPJ") {
      value = formatCNPJ(value)
    } else if (pixKeyType === "PHONE") {
      value = formatPhone(value)
    }

    setPixKey(value)
  }

  useEffect(() => {
    async function loadWithdrawHistory() {
      setIsLoadingHistory(true)
      try {
        const response = await fetch("/api/transactions/withdraw/history?limit=5")
        const data = await response.json()

        if (response.ok && data.withdrawals) {
          setRecentWithdrawals(data.withdrawals)
        }
      } catch (error) {
        console.error("Erro ao carregar histórico de saques:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadWithdrawHistory()
  }, [successMessage]) // Recarregar quando uma nova solicitação for bem-sucedida

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <ProfileNav />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6 relative pb-16 md:pb-6">
          {!showConfirmation ? (
            <div className="max-w-[800px] mx-auto">
              <Card className="border-2 shadow-sm dark:border-border">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Wallet className="h-6 w-6 text-blue-500" />
                    Saque via PIX
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

                  {/* Valor do saque */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium">Valor do saque</label>
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

                  {/* Chave PIX */}
                  <div className="space-y-4">
                    <label className="text-base font-medium">Chave PIX para recebimento</label>

                    <Select value={pixKeyType} onValueChange={setPixKeyType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tipo de chave PIX" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="EMAIL">E-mail</SelectItem>
                        <SelectItem value="PHONE">Telefone</SelectItem>
                        <SelectItem value="EVP">Chave aleatória</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={pixKey}
                      onChange={handlePixKeyChange}
                      placeholder={
                        pixKeyType === "CPF"
                          ? "000.000.000-00"
                          : pixKeyType === "CNPJ"
                            ? "00.000.000/0000-00"
                            : pixKeyType === "EMAIL"
                              ? "email@exemplo.com"
                              : pixKeyType === "PHONE"
                                ? "(00) 00000-0000"
                                : pixKeyType === "EVP"
                                  ? "00000000-0000-0000-0000-000000000000"
                                  : "Digite sua chave PIX"
                      }
                      className="h-12"
                    />
                  </div>

                  {/* Informações importantes */}
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-800 dark:text-blue-300">
                    <h4 className="font-medium mb-2">Informações importantes:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>O valor mínimo para saque é de R$ 50,00</li>
                      <li>Saques são processados em até 24 horas úteis</li>
                      <li>Certifique-se de que a chave PIX informada está correta</li>
                      <li>A chave PIX deve estar registrada em seu nome</li>
                    </ul>
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Valor do saque</span>
                      <span className="font-medium">R$ {amount}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Taxa</span>
                      <span className="font-medium">R$ 0,00</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-medium">Total a receber</span>
                      <span className="font-bold">R$ {Number(amount).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-t pt-6">
                  {/* Primary CTA */}
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 h-14 text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={handleWithdraw}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <span>Solicitar Saque</span>
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Ao clicar em "Solicitar Saque", você concorda com nossos termos e condições.
                  </p>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="max-w-[500px] mx-auto">
              <Card className="border-2 shadow-md dark:border-border">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Solicitação de Saque
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-200 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                      Pendente
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>

                    <div className="text-center">
                      <h3 className="text-xl font-bold">Solicitação Recebida</h3>
                      <p className="text-muted-foreground mt-1">
                        Sua solicitação de saque foi recebida e está sendo processada
                      </p>
                    </div>

                    <div className="w-full space-y-4 mt-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Valor do saque:</span>
                        <span className="font-medium">R$ {Number(amount).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Chave PIX:</span>
                        <span className="font-medium">{pixKey}</span>
                      </div>

                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Tipo de chave:</span>
                        <span className="font-medium">{pixKeyType}</span>
                      </div>

                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">Pendente</span>
                      </div>

                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">ID da transação:</span>
                        <span className="font-medium text-sm">{withdrawId}</span>
                      </div>

                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Data da solicitação:</span>
                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="w-full mt-4">
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-800 dark:text-blue-300">
                        <p className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            Sua solicitação de saque está sendo processada. O valor será transferido para a chave PIX
                            informada em até 24 horas úteis.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 bg-gradient-to-r from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 border-t pt-6">
                  <Button variant="outline" className="w-full h-12" onClick={() => setShowConfirmation(false)}>
                    Voltar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Recent withdrawals */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Retiradas recentes</h2>
            <div className="space-y-4">
              {isLoadingHistory ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-yellow-500 rounded-full border-t-transparent"></div>
                </div>
              ) : recentWithdrawals.length > 0 ? (
                recentWithdrawals.map((withdrawal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        R$ {typeof withdrawal.amount === "number" ? withdrawal.amount.toFixed(2) : withdrawal.amount}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{withdrawal.method}</Badge>
                        <span className="text-xs text-muted-foreground">{withdrawal.date}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        withdrawal.status === "Concluído"
                          ? "success"
                          : withdrawal.status === "Em análise"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {withdrawal.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">Nenhuma retirada encontrada</div>
              )}
            </div>
          </Card>

          <div className="fixed bottom-20 right-4 z-10 md:absolute md:bottom-4">
            <ThemeToggle />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}

