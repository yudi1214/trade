"use client"

import React, { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown, Clock, DollarSign, Plus, Minus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createTrade, getUserTrades, Trade } from '@/services/tradeServices'
import { useRouter } from 'next/navigation'
import axios from 'axios'

// Define o tipo para as propriedades do componente
interface TradePanelProps {
  selectedAsset?: string
  currentPrice?: number
  userId?: string
  userBalance?: number
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void
}

export function TradePanel({ 
  selectedAsset = 'BTCUSD', 
  currentPrice = 0,
  userId,
  userBalance,
  onNotification 
}: TradePanelProps) {
  // Estados
  const [amount, setAmount] = useState('100')
  const [expiration, setExpiration] = useState('1')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('trade')
  const [trades, setTrades] = useState<Trade[]>([])
  const [tradesLoading, setTradesLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  
  // Hooks
  const router = useRouter()
  
  // Efeito para verificar autenticação quando o componente for montado
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    console.log("Token no localStorage:", storedToken ? "Presente" : "Ausente")
    console.log("UserId recebido como prop:", userId)
    
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [])
  
  // Efeito para carregar trades ao abrir a aba de histórico
  useEffect(() => {
    if (activeTab === 'history' && isAuthenticated && userId) {
      loadTrades()
    }
  }, [activeTab, isAuthenticated, userId])
  
  // Função para mostrar notificações
  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    if (onNotification) {
      onNotification(title, message, type)
    } else {
      // Fallback simples caso onNotification não seja fornecido
      console.log(`${type.toUpperCase()}: ${title} - ${message}`)
      alert(`${title}: ${message}`)
    }
  }
  
  // Carrega o histórico de trades
  const loadTrades = async () => {
    if (!isAuthenticated || !userId) {
      showNotification(
        'Não autenticado', 
        'Você precisa estar logado para ver seu histórico de trades.', 
        'error'
      )
      return
    }
    
    setTradesLoading(true)
    try {
      console.log("Carregando trades para userId:", userId)
      const data = await getUserTrades(userId)
      setTrades(data)
    } catch (error) {
      console.error('Erro ao carregar trades:', error)
      
      // Não fazer logout automático
      showNotification(
        'Erro', 
        'Não foi possível carregar seu histórico de trades.', 
        'error'
      )
    } finally {
      setTradesLoading(false)
    }
  }
  
  // Ajusta o valor do trade
  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(1, Number(amount) + delta)
    setAmount(newAmount.toString())
  }
  
  // Valida e formata a entrada do valor
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isNaN(Number(value))) {
      setAmount(value)
    }
  }
  
  // Executa um trade
  const executeTrade = async (direction: 'UP' | 'DOWN') => {
    // Verificação adicional do token antes de executar
    const currentToken = localStorage.getItem('token')
    
    console.log("Executando trade...")
    console.log("Token atual:", currentToken ? "Presente" : "Ausente")
    console.log("isAuthenticated:", isAuthenticated)
    console.log("userId:", userId)
    
    if (!currentToken || !isAuthenticated || !userId) {
      showNotification(
        'Não autenticado', 
        'Você precisa estar logado para realizar trades.', 
        'error'
      )
      
      // Não fazer logout automático, apenas mostrar que precisa autenticar
      return
    }
    
    if (!amount || Number(amount) <= 0) {
      showNotification(
        'Valor inválido', 
        'Por favor, insira um valor válido para o trade.', 
        'error'
      )
      return
    }
    
    setLoading(true)
    try {
      console.log("Enviando dados para criar trade:", {
        userId,
        assetSymbol: selectedAsset,
        amount: Number(amount),
        direction,
        expirationMinutes: Number(expiration)
      })
      
      await createTrade({
        userId,
        assetSymbol: selectedAsset,
        amount: Number(amount),
        direction,
        expirationMinutes: Number(expiration)
      })
      
      showNotification(
        'Trade realizado com sucesso!', 
        `${direction === 'UP' ? 'Compra' : 'Venda'} de ${selectedAsset} por $${amount} com expiração em ${expiration} ${parseInt(expiration) === 1 ? 'minuto' : 'minutos'}.`, 
        'success'
      )
      
      // Se estiver na aba de histórico, recarregar os trades
      if (activeTab === 'history') {
        loadTrades()
      }
      
    } catch (error) {
      console.error('Erro ao executar trade:', error)
      
      // Não fazer logout automático
      showNotification(
        'Falha ao executar trade', 
        error instanceof Error ? error.message : 'Ocorreu um erro ao processar sua solicitação.', 
        'error'
      )
    } finally {
      setLoading(false)
    }
  }
  
  // Formata a data para exibição
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Renderiza o status do trade com a cor apropriada
  const renderStatus = (trade: Trade) => {
    if (trade.result === 'PENDING') {
      return <span className="text-yellow-500 font-medium">Pendente</span>
    } else if (trade.result === 'WIN') {
      return <span className="text-green-500 font-medium">Ganho (+${trade.profit?.toFixed(2)})</span>
    } else {
      return <span className="text-red-500 font-medium">Perda (-${Math.abs(Number(trade.profit)).toFixed(2)})</span>
    }
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trade" className="flex-1 flex flex-col p-4 space-y-6">
          <div className="price-info text-center">
            <h3 className="text-xl font-medium">{selectedAsset}</h3>
            <p className="text-3xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          
          <div className="expiration-select">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Expiração:</span>
            </div>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minuto</SelectItem>
                <SelectItem value="5">5 minutos</SelectItem>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="amount-input">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Valor ($):</span>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustAmount(-10)}
                disabled={Number(amount) <= 10}
                className="rounded-r-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="h-10 text-center rounded-none border-x-0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustAmount(10)}
                className="rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="trade-buttons grid grid-cols-2 gap-4 mt-auto">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white font-medium h-12"
              onClick={() => executeTrade('UP')}
              disabled={loading || !isAuthenticated}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4 mr-2" />
              )}
              Comprar
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white font-medium h-12"
              onClick={() => executeTrade('DOWN')}
              disabled={loading || !isAuthenticated}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-2" />
              )}
              Vender
            </Button>
          </div>
          
          {!isAuthenticated && (
            <div className="text-center text-amber-500 text-sm">
              Você precisa estar logado para realizar trades.
            </div>
          )}
          
          {userBalance !== undefined && (
            <div className="user-balance text-center text-sm text-muted-foreground">
              Seu saldo: ${userBalance.toFixed(2)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 overflow-auto p-2">
          <h3 className="text-lg font-medium mb-3">Histórico de Trades</h3>
          
          {tradesLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center text-muted-foreground py-6">
              Você precisa estar logado para ver seu histórico.
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              Nenhum trade encontrado. Comece a operar!
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => (
                <div key={trade.id} className="bg-card rounded-lg p-3 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{trade.assetSymbol}</span>
                    <span className="text-sm text-muted-foreground">{formatDate(trade.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">
                      {trade.direction === 'UP' ? 
                        <span className="text-green-500">Compra</span> : 
                        <span className="text-red-500">Venda</span>}
                    </span>
                    <span className="font-medium">${trade.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Entrada:</span>
                    <span>${trade.entryPrice.toFixed(2)}</span>
                  </div>
                  {trade.exitPrice && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Saída:</span>
                      <span>${trade.exitPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    {renderStatus(trade)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}