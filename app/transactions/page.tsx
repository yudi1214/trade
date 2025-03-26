"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ProfileNav } from "@/components/profile-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface Transaction {
  id: string
  date: string
  type: "Depósito" | "Saque" | "PIX gerado" | "PIX pago" | "PIX expirado"
  description: string
  value: number
  status: "Pendente" | "Concluído" | "Cancelado" | "Em análise" | "Aprovado" | "Expirado"
  paymentMethod?: string
  protocol?: string
}

const mockTransactions: Transaction[] = [
  {
    id: "TRX00123",
    date: "10/03/2025, 17:15",
    type: "Depósito",
    description: "Depósito via PIX",
    value: 500.0,
    status: "Concluído",
    paymentMethod: "PIX",
    protocol: "PIX789456123",
  },
  {
    id: "TRX00122",
    date: "09/03/2025, 14:30",
    type: "Saque",
    description: "Saque para conta bancária",
    value: -1000.0,
    status: "Em análise",
    paymentMethod: "TED",
    protocol: "TED456789123",
  },
  {
    id: "TRX00121",
    date: "08/03/2025, 09:45",
    type: "PIX gerado",
    description: "PIX gerado para depósito",
    value: 200.0,
    status: "Pendente",
    protocol: "PIX123456789",
  },
  {
    id: "TRX00120",
    date: "07/03/2025, 16:20",
    type: "PIX pago",
    description: "PIX pago para depósito",
    value: 300.0,
    status: "Concluído",
    protocol: "PIX987654321",
  },
  {
    id: "TRX00119",
    date: "06/03/2025, 11:10",
    type: "PIX expirado",
    description: "PIX expirado para depósito",
    value: 150.0,
    status: "Expirado",
    protocol: "PIX654321987",
  },
  {
    id: "TRX00118",
    date: "05/03/2025, 13:25",
    type: "Saque",
    description: "Saque para conta bancária",
    value: -500.0,
    status: "Aprovado",
    paymentMethod: "TED",
    protocol: "TED321654987",
  },
]

export default function TransactionsPage() {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "Concluído":
        return "success"
      case "Pendente":
        return "warning"
      case "Cancelado":
        return "destructive"
      case "Em análise":
        return "secondary"
      case "Aprovado":
        return "success"
      case "Expirado":
        return "destructive"
      default:
        return "default"
    }
  }

  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "Depósito":
        return "success"
      case "Saque":
        return "destructive"
      case "PIX gerado":
        return "warning"
      case "PIX pago":
        return "success"
      case "PIX expirado":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          <ProfileNav />

          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
              <h1 className="text-2xl font-bold">Transações</h1>

              {/* Filters - Matching the screenshot layout */}
              <div className="grid gap-4 md:grid-cols-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                      placeholder="dd/mm/aaaa"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="deposit">Depósito</SelectItem>
                      <SelectItem value="withdrawal">Saque</SelectItem>
                      <SelectItem value="pix_generated">PIX gerado</SelectItem>
                      <SelectItem value="pix_paid">PIX pago</SelectItem>
                      <SelectItem value="pix_expired">PIX expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="analysis">Em análise</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="bg-yellow-500 hover:bg-yellow-600">Aplicar Filtros</Button>
              </div>

              {/* Transactions Table - Matching the screenshot layout */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Data</th>
                        <th className="text-left p-3 font-medium">Tipo</th>
                        <th className="text-left p-3 font-medium">Descrição</th>
                        <th className="text-left p-3 font-medium">Valor</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-3">{transaction.date}</td>
                          <td className="p-3">
                            <Badge variant={getTypeColor(transaction.type)}>{transaction.type}</Badge>
                          </td>
                          <td className="p-3">{transaction.description}</td>
                          <td className="p-3">
                            <span className={transaction.value >= 0 ? "text-green-500" : "text-red-500"}>
                              {transaction.value >= 0 ? "+" : ""} R$ {Math.abs(transaction.value).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge variant={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedTransaction(transaction)}>
                              <Search className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination - Matching the screenshot layout */}
                <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">Página {currentPage} de 2</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === 2}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">ID</span>
                  <p className="font-medium">{selectedTransaction.id}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Data</span>
                  <p className="font-medium">{selectedTransaction.date}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Tipo</span>
                <div className="mt-1">
                  <Badge variant={getTypeColor(selectedTransaction.type)}>{selectedTransaction.type}</Badge>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Descrição</span>
                <p className="font-medium">{selectedTransaction.description}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Valor</span>
                <p className={`font-medium ${selectedTransaction.value >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {selectedTransaction.value >= 0 ? "+" : ""} R$ {Math.abs(selectedTransaction.value).toFixed(2)}
                </p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="mt-1">
                  <Badge variant={getStatusColor(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                </div>
              </div>

              {selectedTransaction.paymentMethod && (
                <div>
                  <span className="text-sm text-muted-foreground">Método de Pagamento</span>
                  <p className="font-medium">{selectedTransaction.paymentMethod}</p>
                </div>
              )}

              {selectedTransaction.protocol && (
                <div>
                  <span className="text-sm text-muted-foreground">Protocolo</span>
                  <p className="font-medium">{selectedTransaction.protocol}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  )
}

