"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Search,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Filter,
  ChevronDown,
  Clock,
  BarChart2,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { authService } from "@/lib/api"

interface Operation {
  date: string
  asset: string
  type: "Compra" | "Venda"
  result: "Ganho" | "Perda"
  profit: number
}

interface Trader {
  id: string
  name: string
  avatar: string
  followers: number
  profit: number
  winRate: number
  totalTrades: number
  online: boolean
  description: string
  assets: string[]
  operations: Operation[]
  activityDays: number
  following?: boolean
  riskLevel: "Baixo" | "Médio" | "Alto"
  profitTrend: "up" | "down" | "stable"
  lastActivity: string
}

export default function CopyTraderPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("traders")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null)
  const [copyAmount, setCopyAmount] = useState("50")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState("profit")
  const [timeFrame, setTimeFrame] = useState("all")
  const [autoCopy, setAutoCopy] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  const mockTraders: Trader[] = [
    {
      id: "1",
      name: "Alex Morgan",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      followers: 2547,
      profit: 87.5,
      winRate: 92,
      totalTrades: 365,
      online: true,
      description:
        "Trader profissional com 5 anos de experiência em opções binárias. Especialista em análise técnica e tendências de mercado.",
      assets: ["EUR/USD", "GBP/USD", "BTC/USD"],
      operations: [
        {
          date: "15/02/2025, 14:30",
          asset: "EUR/USD",
          type: "Compra",
          result: "Ganho",
          profit: 87,
        },
        {
          date: "14/02/2025, 10:15",
          asset: "BTC/USD",
          type: "Venda",
          result: "Ganho",
          profit: 92,
        },
      ],
      activityDays: 145,
      riskLevel: "Médio",
      profitTrend: "up",
      lastActivity: "5 min atrás",
      following: true,
    },
    {
      id: "2",
      name: "Michael Chen",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      followers: 1982,
      profit: 72.3,
      winRate: 85,
      totalTrades: 248,
      online: false,
      description:
        "Especialista em criptomoedas com foco em Bitcoin e Ethereum. Análise fundamentalista e técnica para operações de médio prazo.",
      assets: ["BTC/USD", "ETH/USD", "LTC/USD"],
      operations: [
        {
          date: "13/02/2025, 09:45",
          asset: "BTC/USD",
          type: "Compra",
          result: "Ganho",
          profit: 65,
        },
      ],
      activityDays: 90,
      riskLevel: "Alto",
      profitTrend: "up",
      lastActivity: "2h atrás",
    },
    {
      id: "3",
      name: "Sophia Williams",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      followers: 3214,
      profit: 65.8,
      winRate: 78,
      totalTrades: 412,
      online: true,
      description:
        "Especialista em opções e derivativos. Estratégias de hedge e operações direcionais com alto retorno.",
      assets: ["AAPL", "MSFT", "GOOGL", "AMZN"],
      operations: [],
      activityDays: 210,
      riskLevel: "Médio",
      profitTrend: "stable",
      lastActivity: "20 min atrás",
      following: true,
    },
    {
      id: "4",
      name: "David Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      followers: 1756,
      profit: 58.2,
      winRate: 76,
      totalTrades: 289,
      online: true,
      description:
        "Especialista em mercado forex com foco em pares principais. Análise técnica e fundamentalista para operações de curto prazo.",
      assets: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"],
      operations: [
        {
          date: "12/02/2025, 11:20",
          asset: "EUR/USD",
          type: "Venda",
          result: "Ganho",
          profit: 72,
        },
      ],
      activityDays: 120,
      riskLevel: "Baixo",
      profitTrend: "stable",
      lastActivity: "1h atrás",
    },
    {
      id: "5",
      name: "Emma Johnson",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      followers: 2105,
      profit: 81.4,
      winRate: 88,
      totalTrades: 325,
      online: false,
      description:
        "Especialista em ações de tecnologia. Análise fundamentalista e técnica para operações de longo prazo.",
      assets: ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"],
      operations: [
        {
          date: "10/02/2025, 15:45",
          asset: "TSLA",
          type: "Compra",
          result: "Ganho",
          profit: 95,
        },
      ],
      activityDays: 180,
      riskLevel: "Médio",
      profitTrend: "up",
      lastActivity: "6h atrás",
    },
  ]

  const stats = {
    totalCopiedOperations: 5,
    winRate: 60,
    totalProfit: 20.0,
    followedTraders: 2,
  }

  const copiedOperations = [
    {
      date: "15/02/2025, 14:30",
      trader: "Alex Morgan",
      asset: "EUR/USD",
      type: "Compra",
      value: 50.0,
      result: "Ganho",
      profit: 43.5,
    },
    {
      date: "14/02/2025, 10:15",
      trader: "Sophia Williams",
      asset: "AAPL",
      type: "Compra",
      value: 100.0,
      result: "Ganho",
      profit: 84.0,
    },
  ]

  const handleFollow = (trader: Trader) => {
    // Implementação real faria uma chamada de API
    trader.following = !trader.following
    setSelectedTrader(null)
  }

  const filteredTraders = mockTraders.filter((trader) => trader.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedTraders = [...filteredTraders].sort((a, b) => {
    if (sortBy === "profit") return b.profit - a.profit
    if (sortBy === "winRate") return b.winRate - a.winRate
    if (sortBy === "followers") return b.followers - a.followers
    return 0
  })

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Top navigation */}
          <div className="border-b">
            <div className="flex justify-between items-center px-4">
              <nav className="flex overflow-x-auto">
                {["Depósito", "Retirada", "Transações", "Operações", "Perfil", "Torneio", "Copy"].map((item) => (
                  <button
                    key={item}
                    className={`px-4 py-3 border-b-2 min-w-max ${
                      item === "Copy"
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-green-500 hover:bg-green-600 text-white border-0">
                  Depositar
                </Button>
                <div className="flex items-center gap-2 px-3 py-1 border rounded-md">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span className="font-medium">$10000.00</span>
                  <span className="text-muted-foreground text-sm">DEMO</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-muted/50 rounded-lg p-1 mb-4">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="traders" className="flex-1">
                      Traders
                    </TabsTrigger>
                    <TabsTrigger value="following" className="flex-1">
                      Seguindo
                    </TabsTrigger>
                    <TabsTrigger value="results" className="flex-1">
                      Resultados
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="traders">
                  {/* Search and filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar traders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <select
                      className="bg-background border rounded-md px-3 py-2"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="profit">Lucro</option>
                      <option value="winRate">Win Rate</option>
                      <option value="followers">Seguidores</option>
                    </select>
                    <select
                      className="bg-background border rounded-md px-3 py-2"
                      value={timeFrame}
                      onChange={(e) => setTimeFrame(e.target.value)}
                    >
                      <option value="all">Todo período</option>
                      <option value="7d">7 dias</option>
                      <option value="30d">30 dias</option>
                      <option value="90d">90 dias</option>
                    </select>
                    <Button variant="outline" size="icon" onClick={() => setIsFiltersOpen(true)}>
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Traders list */}
                  <div className="grid gap-4">
                    {sortedTraders.map((trader) => (
                      <Card
                        key={trader.id}
                        className="overflow-hidden border hover:border-primary/50 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar className="h-12 w-12 border-2 border-background">
                                  <img src={trader.avatar || "/placeholder.svg"} alt={trader.name} />
                                </Avatar>
                                <div
                                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${trader.online ? "bg-green-500" : "bg-gray-400"}`}
                                ></div>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{trader.name}</h3>
                                  <Badge variant={trader.online ? "success" : "secondary"} className="h-5">
                                    {trader.online ? "Online" : "Offline"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{trader.followers} seguidores</span>
                                  <span className="text-xs">•</span>
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {trader.lastActivity}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${trader.following ? "text-yellow-500" : "text-muted-foreground"}`}
                                onClick={() => {
                                  trader.following = !trader.following
                                }}
                              >
                                <Star className={`h-4 w-4 ${trader.following ? "fill-yellow-500" : ""}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedTrader(trader)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-muted-foreground">Lucro</span>
                              <span
                                className={`flex items-center font-medium ${
                                  trader.profitTrend === "up"
                                    ? "text-green-500"
                                    : trader.profitTrend === "down"
                                      ? "text-red-500"
                                      : "text-yellow-500"
                                }`}
                              >
                                {trader.profitTrend === "up" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                                {trader.profitTrend === "down" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                                {trader.profitTrend === "stable" && <TrendingUp className="h-3 w-3 mr-1" />}+
                                {trader.profit}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                              <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                style={{ width: `${Math.min(trader.profit, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Taxa de Acerto</p>
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                    style={{ width: `${trader.winRate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{trader.winRate}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
                              <p className="font-medium">{trader.totalTrades}</p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground mb-1">Ativos</p>
                            <div className="flex flex-wrap gap-1">
                              {trader.assets.map((asset) => (
                                <Badge key={asset} variant="secondary" className="text-xs">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <Badge
                              variant={
                                trader.riskLevel === "Baixo"
                                  ? "success"
                                  : trader.riskLevel === "Médio"
                                    ? "warning"
                                    : "destructive"
                              }
                            >
                              Risco {trader.riskLevel}
                            </Badge>
                            <Button
                              className={`${trader.following ? "bg-gray-900 hover:bg-gray-800" : "bg-primary hover:bg-primary/90"}`}
                              onClick={() => handleFollow(trader)}
                            >
                              {trader.following ? "Seguindo" : "Copiar Trader"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="following">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-background to-muted/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                          <BarChart2 className="h-4 w-4" />
                          <h3 className="font-medium">Total de Operações Copiadas</h3>
                        </div>
                        <p className="text-3xl font-bold">{stats.totalCopiedOperations}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-background to-muted/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          <h3 className="font-medium">Taxa de Acerto</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-3xl font-bold">{stats.winRate}%</p>
                          <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                              style={{ width: `${stats.winRate}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-background to-muted/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                          <h3 className="font-medium">Lucro Total</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-500">+R$ {stats.totalProfit.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-background to-muted/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <h3 className="font-medium">Traders Seguidos</h3>
                        </div>
                        <p className="text-3xl font-bold">{stats.followedTraders}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Histórico de operações copiadas</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Cópia automática</span>
                        <Switch checked={autoCopy} onCheckedChange={setAutoCopy} />
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-3 font-medium">Data</th>
                            <th className="text-left p-3 font-medium">Trader</th>
                            <th className="text-left p-3 font-medium">Ativo</th>
                            <th className="text-left p-3 font-medium">Tipo</th>
                            <th className="text-left p-3 font-medium">Valor</th>
                            <th className="text-left p-3 font-medium">Resultado</th>
                            <th className="text-left p-3 font-medium">Lucro/Perda</th>
                          </tr>
                        </thead>
                        <tbody>
                          {copiedOperations.map((op, index) => (
                            <tr key={index} className="border-t hover:bg-muted/30 transition-colors">
                              <td className="p-3">{op.date}</td>
                              <td className="p-3">{op.trader}</td>
                              <td className="p-3">{op.asset}</td>
                              <td className="p-3">
                                <Badge variant={op.type === "Compra" ? "success" : "destructive"}>{op.type}</Badge>
                              </td>
                              <td className="p-3">R$ {op.value.toFixed(2)}</td>
                              <td className="p-3">
                                <Badge variant={op.result === "Ganho" ? "success" : "destructive"}>{op.result}</Badge>
                              </td>
                              <td className="p-3 text-green-500">+R$ {op.profit.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="results">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum resultado disponível</h3>
                    <p className="text-muted-foreground max-w-md">
                      Os resultados serão exibidos aqui quando você começar a copiar operações de traders.
                    </p>
                    <Button className="mt-4" onClick={() => setActiveTab("traders")}>
                      Explorar Traders
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />

      {/* Trader Profile Dialog */}
      {selectedTrader && (
        <Dialog open={!!selectedTrader} onOpenChange={() => setSelectedTrader(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Perfil do Trader</DialogTitle>
            </DialogHeader>

            <div className="flex items-start gap-4 mb-6">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-background">
                  <img src={selectedTrader.avatar || "/placeholder.svg"} alt={selectedTrader.name} />
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${selectedTrader.online ? "bg-green-500" : "bg-gray-400"}`}
                ></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{selectedTrader.name}</h2>
                  <Badge variant={selectedTrader.online ? "success" : "secondary"}>
                    {selectedTrader.online ? "Online" : "Offline"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{selectedTrader.followers} seguidores</p>
                <p className="mt-2">{selectedTrader.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Lucro</p>
                  <p className="text-xl font-bold text-green-500">+{selectedTrader.profit}%</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
                  <p className="text-xl font-bold">{selectedTrader.winRate}%</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total de Operações</p>
                  <p className="text-xl font-bold">{selectedTrader.totalTrades}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Tempo de Atividade</p>
                  <p className="text-xl font-bold">{selectedTrader.activityDays} dias</p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Ativos Operados</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTrader.assets.map((asset) => (
                  <Badge key={asset} variant="secondary">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-4">Histórico de Operações</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Data</th>
                      <th className="text-left p-3 font-medium">Ativo</th>
                      <th className="text-left p-3 font-medium">Tipo</th>
                      <th className="text-left p-3 font-medium">Resultado</th>
                      <th className="text-right p-3 font-medium">Lucro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTrader.operations.length > 0 ? (
                      selectedTrader.operations.map((op, index) => (
                        <tr key={index} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-3">{op.date}</td>
                          <td className="p-3">{op.asset}</td>
                          <td className="p-3">
                            <Badge variant={op.type === "Compra" ? "success" : "destructive"}>{op.type}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={op.result === "Ganho" ? "success" : "destructive"}>{op.result}</Badge>
                          </td>
                          <td className="p-3 text-right text-green-500">+{op.profit}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          Nenhuma operação recente
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter>
              <div className="w-full flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                  <p className="text-sm text-muted-foreground mb-2">Valor por operação</p>
                  <Input
                    type="number"
                    value={copyAmount}
                    onChange={(e) => setCopyAmount(e.target.value)}
                    className="w-full md:max-w-[200px]"
                  />
                </div>
                <Button
                  size="lg"
                  className={`w-full md:w-auto ${selectedTrader.following ? "bg-gray-900 hover:bg-gray-800" : "bg-yellow-500 hover:bg-yellow-600"}`}
                  onClick={() => handleFollow(selectedTrader)}
                >
                  {selectedTrader.following ? "Seguindo" : "Seguir"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

