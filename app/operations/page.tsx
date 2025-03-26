"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ProfileNav } from "@/components/profile-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info } from "lucide-react"

interface Operation {
  id: string
  date: string
  asset: string
  type: "Compra" | "Venda"
  value: number
  entry: number
  exit: number
  profit: number
  result: "Ganho" | "Perda"
  expiration: string
  observations?: string
}

const mockOperations: Operation[] = [
  {
    id: "OP00123",
    date: "15/02/2025, 14:30",
    asset: "EUR/USD",
    type: "Compra",
    value: 100.0,
    entry: 1.0857,
    exit: 1.087,
    profit: 87.0,
    result: "Ganho",
    expiration: "30 minutos",
    observations: "Tendência de alta confirmada por suporte em 1.0850",
  },
  {
    id: "OP00122",
    date: "14/02/2025, 10:15",
    asset: "BTC/USD",
    type: "Venda",
    value: 200.0,
    entry: 42800.0,
    exit: 41800.0,
    profit: 174.0,
    result: "Ganho",
    expiration: "15 minutos",
  },
  {
    id: "OP00121",
    date: "13/02/2025, 16:45",
    asset: "USD/JPY",
    type: "Compra",
    value: 150.0,
    entry: 145.78,
    exit: 145.65,
    profit: -150.0,
    result: "Perda",
    expiration: "1 hora",
    observations: "Stop loss atingido",
  },
]

export default function OperationsPage() {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [selectedAsset, setSelectedAsset] = useState<string>("all")
  const [selectedResult, setSelectedResult] = useState<string>("all")
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)

  const stats = {
    totalOperations: 10,
    winRate: 63,
    totalProfit: 227.5,
    openOperations: 2,
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
              <h1 className="text-2xl font-bold">Operações</h1>

              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ativo</label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os ativos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os ativos</SelectItem>
                      <SelectItem value="EURUSD">EUR/USD</SelectItem>
                      <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                      <SelectItem value="USDJPY">USD/JPY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Resultado</label>
                  <Select value={selectedResult} onValueChange={setSelectedResult}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os resultados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os resultados</SelectItem>
                      <SelectItem value="win">Ganho</SelectItem>
                      <SelectItem value="loss">Perda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="bg-yellow-500 hover:bg-yellow-600">Aplicar Filtros</Button>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Total de Operações</span>
                      <span className="text-2xl font-bold">{stats.totalOperations}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Taxa de Acerto</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{stats.winRate}%</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 transition-all" style={{ width: `${stats.winRate}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Lucro Total</span>
                      <span className="text-2xl font-bold text-green-500">+R$ {stats.totalProfit.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Operações em Aberto</span>
                      <span className="text-2xl font-bold">{stats.openOperations}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Operations Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Data</th>
                        <th className="text-left p-3 font-medium">Ativo</th>
                        <th className="text-left p-3 font-medium">Tipo</th>
                        <th className="text-left p-3 font-medium">Valor</th>
                        <th className="text-left p-3 font-medium">Entrada</th>
                        <th className="text-left p-3 font-medium">Saída</th>
                        <th className="text-left p-3 font-medium">Lucro/Perda</th>
                        <th className="text-left p-3 font-medium">Resultado</th>
                        <th className="text-left p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOperations.map((operation) => (
                        <tr key={operation.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-3">{operation.date}</td>
                          <td className="p-3">{operation.asset}</td>
                          <td className="p-3">
                            <Badge variant={operation.type === "Compra" ? "success" : "destructive"}>
                              {operation.type}
                            </Badge>
                          </td>
                          <td className="p-3">R$ {operation.value.toFixed(2)}</td>
                          <td className="p-3">{operation.entry}</td>
                          <td className="p-3">{operation.exit}</td>
                          <td className="p-3">
                            <span className={operation.profit >= 0 ? "text-green-500" : "text-red-500"}>
                              {operation.profit >= 0 ? "+" : ""} R$ {operation.profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge variant={operation.result === "Ganho" ? "success" : "destructive"}>
                              {operation.result}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOperation(operation)}>
                              <Info className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/50">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">Página 1 de 1</span>
                  <Button variant="outline" size="sm" disabled>
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Operation Details Modal */}
      <Dialog open={!!selectedOperation} onOpenChange={() => setSelectedOperation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Operação</DialogTitle>
          </DialogHeader>

          {selectedOperation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">ID</span>
                  <p className="font-medium">{selectedOperation.id}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Data</span>
                  <p className="font-medium">{selectedOperation.date}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Ativo</span>
                <p className="font-medium">{selectedOperation.asset}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Tipo</span>
                <div className="mt-1">
                  <Badge variant={selectedOperation.type === "Compra" ? "success" : "destructive"}>
                    {selectedOperation.type}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Valor</span>
                <p className="font-medium">R$ {selectedOperation.value.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Preço de Entrada</span>
                  <p className="font-medium">{selectedOperation.entry}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Preço de Saída</span>
                  <p className="font-medium">{selectedOperation.exit}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Tempo de Expiração</span>
                <p className="font-medium">{selectedOperation.expiration}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Lucro/Perda</span>
                <p className={`font-medium ${selectedOperation.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {selectedOperation.profit >= 0 ? "+" : ""} R$ {selectedOperation.profit.toFixed(2)}
                </p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Resultado</span>
                <div className="mt-1">
                  <Badge variant={selectedOperation.result === "Ganho" ? "success" : "destructive"}>
                    {selectedOperation.result}
                  </Badge>
                </div>
              </div>

              {selectedOperation.observations && (
                <div>
                  <span className="text-sm text-muted-foreground">Observações</span>
                  <p className="mt-1 text-sm">{selectedOperation.observations}</p>
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

