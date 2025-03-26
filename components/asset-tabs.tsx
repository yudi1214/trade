"use client"

import type React from "react"
import { useState, useContext, createContext, useEffect } from "react"
import { X, Search } from "lucide-react"
import { AssetSearch } from "./asset-search"
import { AssetIcon } from "./asset-icon"
import { Button } from "@/components/ui/button"

// Função para obter a cor de borda do ativo com base na categoria
function getAssetBorderColor(category: string) {
  switch (category) {
    case "crypto":
      return "border-blue-500/20"
    case "forex":
      return "border-green-500/20"
    case "stocks":
      return "border-indigo-500/20"
    case "commodities":
      return "border-amber-500/20"
    case "indices":
      return "border-red-500/20"
    default:
      return "border-gray-500/20"
  }
}

// Criar contexto para compartilhar o símbolo selecionado
interface AssetContextType {
  currentSymbol: string
  setCurrentSymbol: (symbol: string) => void
}

const AssetContext = createContext<AssetContextType>({
  currentSymbol: "BINANCE:BTCUSDT",
  setCurrentSymbol: () => {},
})

export const useAssetContext = () => useContext(AssetContext)

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [currentSymbol, setCurrentSymbol] = useState("BINANCE:BTCUSDT")
  return <AssetContext.Provider value={{ currentSymbol, setCurrentSymbol }}>{children}</AssetContext.Provider>
}

interface Asset {
  symbol: string
  displayName: string
  active: boolean
  tradingViewSymbol: string
  category: "crypto" | "forex" | "stocks" | "commodities" | "indices"
}

// Updated initial assets to show popular ones first
const INITIAL_ASSETS: Asset[] = [
  { symbol: "BTC/USD", displayName: "Bitcoin", active: true, tradingViewSymbol: "BINANCE:BTCUSDT", category: "crypto" },
  {
    symbol: "ETH/USD",
    displayName: "Ethereum",
    active: false,
    tradingViewSymbol: "BINANCE:ETHUSDT",
    category: "crypto",
  },
  { symbol: "AAPL", displayName: "Apple", active: false, tradingViewSymbol: "NASDAQ:AAPL", category: "stocks" },
]

export function AssetTabs() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const { setCurrentSymbol } = useAssetContext()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleAssetClick = (index: number) => {
    const updatedAssets = assets.map((a, i) => ({
      ...a,
      active: i === index,
    }))

    setAssets(updatedAssets)
    const selectedAsset = updatedAssets[index]
    setCurrentSymbol(selectedAsset.tradingViewSymbol)
  }

  const handleRemoveAsset = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    if (assets.length <= 1) return

    const newAssets = assets.filter((_, i) => i !== index)
    if (assets[index].active && newAssets.length > 0) {
      newAssets[0].active = true
      setCurrentSymbol(newAssets[0].tradingViewSymbol)
    }
    setAssets(newAssets)
  }

  const handleAddAsset = (newAsset: {
    symbol: string
    displayName: string
    tradingViewSymbol: string
    category: "crypto" | "forex" | "stocks" | "commodities" | "indices"
  }) => {
    // Verificar se o ativo já existe
    const assetExists = assets.some((asset) => asset.symbol === newAsset.symbol)
    if (assetExists) {
      // Se já existe, apenas ative-o
      const updatedAssets = assets.map((asset) => ({
        ...asset,
        active: asset.symbol === newAsset.symbol,
      }))
      setAssets(updatedAssets)
      setCurrentSymbol(newAsset.tradingViewSymbol)
    } else {
      // Se não existe, adicione-o como ativo
      const asset: Asset = {
        symbol: newAsset.symbol,
        displayName: newAsset.displayName,
        active: true,
        tradingViewSymbol: newAsset.tradingViewSymbol,
        category: newAsset.category,
      }

      // Desativar todos os outros ativos
      const updatedAssets = assets.map((a) => ({ ...a, active: false }))
      setAssets([...updatedAssets, asset])
      setCurrentSymbol(newAsset.tradingViewSymbol)
    }

    // Close search dialog after selection
    setIsSearchOpen(false)
  }

  return (
    <div className="bg-background">
      <div className="flex items-center p-2 gap-2 overflow-x-auto scrollbar-hide">
        {/* Asset tabs - now first */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {assets.map((asset, index) => (
            <div
              key={asset.symbol}
              className={`
                flex h-9 items-center gap-1.5 rounded-md px-3 border shrink-0
                ${
                  asset.active
                    ? `bg-muted/80 ${getAssetBorderColor(asset.category)}`
                    : `hover:bg-muted/50 border-transparent`
                }
                cursor-pointer whitespace-nowrap transition-colors group
              `}
              onClick={() => handleAssetClick(index)}
            >
              <div className="flex items-center gap-1.5">
                <AssetIcon symbol={asset.symbol} category={asset.category} size={16} />
                <span className="text-sm font-medium">{asset.displayName}</span>
              </div>
              {assets.length > 1 && (
                <button
                  onClick={(e) => handleRemoveAsset(e, index)}
                  className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Fechar ${asset.displayName}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Search button - simplified design */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-sm text-muted-foreground hover:bg-muted"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Remove the additional add button since we already have search */}
      </div>

      {/* Asset search dialog */}
      <AssetSearch onSelect={handleAddAsset} isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  )
}

