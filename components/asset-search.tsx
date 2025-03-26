"use client"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Search, X, Flame } from "lucide-react"
import { AssetIcon } from "./asset-icon"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Asset {
  symbol: string
  displayName: string
  tradingViewSymbol: string
  category: "crypto" | "forex" | "stocks" | "commodities" | "indices"
  popular?: boolean
}

// Lista de ativos disponíveis - reorganizada com os mais populares primeiro
const AVAILABLE_ASSETS: Asset[] = [
  // Ativos populares
  {
    symbol: "BTC/USD",
    displayName: "Bitcoin",
    tradingViewSymbol: "BINANCE:BTCUSDT",
    category: "crypto",
    popular: true,
  },
  {
    symbol: "ETH/USD",
    displayName: "Ethereum",
    tradingViewSymbol: "BINANCE:ETHUSDT",
    category: "crypto",
    popular: true,
  },
  {
    symbol: "AAPL",
    displayName: "Apple Inc.",
    tradingViewSymbol: "NASDAQ:AAPL",
    category: "stocks",
    popular: true,
  },
  {
    symbol: "GOOGL",
    displayName: "Alphabet Inc.",
    tradingViewSymbol: "NASDAQ:GOOGL",
    category: "stocks",
    popular: true,
  },
  {
    symbol: "META",
    displayName: "Meta Platforms Inc.",
    tradingViewSymbol: "NASDAQ:META",
    category: "stocks",
    popular: true,
  },
  {
    symbol: "MCD",
    displayName: "McDonald's Corp.",
    tradingViewSymbol: "NYSE:MCD",
    category: "stocks",
    popular: true,
  },
  {
    symbol: "EUR/USD",
    displayName: "Euro/US Dollar",
    tradingViewSymbol: "OANDA:EURUSD",
    category: "forex",
    popular: true,
  },
  {
    symbol: "GOLD",
    displayName: "Gold",
    tradingViewSymbol: "COMEX:GC1!",
    category: "commodities",
    popular: true,
  },

  // Criptomoedas - Principais
  {
    symbol: "SOL/USD",
    displayName: "Solana",
    tradingViewSymbol: "BINANCE:SOLUSDT",
    category: "crypto",
  },
  { symbol: "XRP/USD", displayName: "Ripple", tradingViewSymbol: "BINANCE:XRPUSDT", category: "crypto" },
  { symbol: "ADA/USD", displayName: "Cardano", tradingViewSymbol: "BINANCE:ADAUSDT", category: "crypto" },
  { symbol: "DOGE/USD", displayName: "Dogecoin", tradingViewSymbol: "BINANCE:DOGEUSDT", category: "crypto" },
  { symbol: "DOT/USD", displayName: "Polkadot", tradingViewSymbol: "BINANCE:DOTUSDT", category: "crypto" },
  { symbol: "LINK/USD", displayName: "Chainlink", tradingViewSymbol: "BINANCE:LINKUSDT", category: "crypto" },
  { symbol: "MATIC/USD", displayName: "Polygon", tradingViewSymbol: "BINANCE:MATICUSDT", category: "crypto" },
  { symbol: "AVAX/USD", displayName: "Avalanche", tradingViewSymbol: "BINANCE:AVAXUSDT", category: "crypto" },
  { symbol: "UNI/USD", displayName: "Uniswap", tradingViewSymbol: "BINANCE:UNIUSDT", category: "crypto" },
  { symbol: "AAVE/USD", displayName: "Aave", tradingViewSymbol: "BINANCE:AAVEUSDT", category: "crypto" },
  { symbol: "ATOM/USD", displayName: "Cosmos", tradingViewSymbol: "BINANCE:ATOMUSDT", category: "crypto" },
  { symbol: "LTC/USD", displayName: "Litecoin", tradingViewSymbol: "BINANCE:LTCUSDT", category: "crypto" },
  { symbol: "BCH/USD", displayName: "Bitcoin Cash", tradingViewSymbol: "BINANCE:BCHUSDT", category: "crypto" },
  { symbol: "ALGO/USD", displayName: "Algorand", tradingViewSymbol: "BINANCE:ALGOUSDT", category: "crypto" },
  { symbol: "FIL/USD", displayName: "Filecoin", tradingViewSymbol: "BINANCE:FILUSDT", category: "crypto" },
  { symbol: "NEAR/USD", displayName: "NEAR Protocol", tradingViewSymbol: "BINANCE:NEARUSDT", category: "crypto" },
  { symbol: "APE/USD", displayName: "ApeCoin", tradingViewSymbol: "BINANCE:APEUSDT", category: "crypto" },
  { symbol: "SHIB/USD", displayName: "Shiba Inu", tradingViewSymbol: "BINANCE:SHIBUSDT", category: "crypto" },

  // Forex - Principais pares de moedas
  { symbol: "GBP/USD", displayName: "British Pound/US Dollar", tradingViewSymbol: "OANDA:GBPUSD", category: "forex" },
  { symbol: "USD/JPY", displayName: "US Dollar/Japanese Yen", tradingViewSymbol: "OANDA:USDJPY", category: "forex" },
  { symbol: "USD/CHF", displayName: "US Dollar/Swiss Franc", tradingViewSymbol: "OANDA:USDCHF", category: "forex" },
  {
    symbol: "AUD/USD",
    displayName: "Australian Dollar/US Dollar",
    tradingViewSymbol: "OANDA:AUDUSD",
    category: "forex",
  },
  { symbol: "USD/CAD", displayName: "US Dollar/Canadian Dollar", tradingViewSymbol: "OANDA:USDCAD", category: "forex" },
  {
    symbol: "NZD/USD",
    displayName: "New Zealand Dollar/US Dollar",
    tradingViewSymbol: "OANDA:NZDUSD",
    category: "forex",
  },
  { symbol: "EUR/GBP", displayName: "Euro/British Pound", tradingViewSymbol: "OANDA:EURGBP", category: "forex" },
  { symbol: "EUR/JPY", displayName: "Euro/Japanese Yen", tradingViewSymbol: "OANDA:EURJPY", category: "forex" },
  {
    symbol: "GBP/JPY",
    displayName: "British Pound/Japanese Yen",
    tradingViewSymbol: "OANDA:GBPJPY",
    category: "forex",
  },

  // Ações - EUA
  { symbol: "MSFT", displayName: "Microsoft Corporation", tradingViewSymbol: "NASDAQ:MSFT", category: "stocks" },
  { symbol: "AMZN", displayName: "Amazon.com Inc.", tradingViewSymbol: "NASDAQ:AMZN", category: "stocks" },
  { symbol: "TSLA", displayName: "Tesla Inc.", tradingViewSymbol: "NASDAQ:TSLA", category: "stocks" },
  { symbol: "NVDA", displayName: "NVIDIA Corporation", tradingViewSymbol: "NASDAQ:NVDA", category: "stocks" },
  { symbol: "JPM", displayName: "JPMorgan Chase & Co.", tradingViewSymbol: "NYSE:JPM", category: "stocks" },
  { symbol: "V", displayName: "Visa Inc.", tradingViewSymbol: "NYSE:V", category: "stocks" },
  { symbol: "WMT", displayName: "Walmart Inc.", tradingViewSymbol: "NYSE:WMT", category: "stocks" },

  // Ações - Brasil
  { symbol: "PETR4", displayName: "Petrobras PN", tradingViewSymbol: "BMFBOVESPA:PETR4", category: "stocks" },
  { symbol: "VALE3", displayName: "Vale ON", tradingViewSymbol: "BMFBOVESPA:VALE3", category: "stocks" },
  { symbol: "ITUB4", displayName: "Itaú Unibanco PN", tradingViewSymbol: "BMFBOVESPA:ITUB4", category: "stocks" },
  { symbol: "BBDC4", displayName: "Bradesco PN", tradingViewSymbol: "BMFBOVESPA:BBDC4", category: "stocks" },
  { symbol: "ABEV3", displayName: "Ambev ON", tradingViewSymbol: "BMFBOVESPA:ABEV3", category: "stocks" },

  // Commodities
  { symbol: "SILVER", displayName: "Silver", tradingViewSymbol: "COMEX:SI1!", category: "commodities" },
  { symbol: "OIL.WTI", displayName: "Crude Oil WTI", tradingViewSymbol: "NYMEX:CL1!", category: "commodities" },
  { symbol: "OIL.BRENT", displayName: "Crude Oil Brent", tradingViewSymbol: "NYMEX:BZ1!", category: "commodities" },
  { symbol: "NATGAS", displayName: "Natural Gas", tradingViewSymbol: "NYMEX:NG1!", category: "commodities" },
  { symbol: "COPPER", displayName: "Copper", tradingViewSymbol: "COMEX:HG1!", category: "commodities" },

  // Índices
  {
    symbol: "SPX",
    displayName: "S&P 500",
    tradingViewSymbol: "FOREXCOM:SPXUSD",
    category: "indices",
  },
  { symbol: "NDX", displayName: "Nasdaq 100", tradingViewSymbol: "FOREXCOM:NSXUSD", category: "indices" },
  { symbol: "DJI", displayName: "Dow Jones Industrial", tradingViewSymbol: "DJ:DJI", category: "indices" },
  { symbol: "IBOV", displayName: "Ibovespa", tradingViewSymbol: "BMFBOVESPA:IBOV", category: "indices" },
  { symbol: "DAX", displayName: "DAX 40", tradingViewSymbol: "FOREXCOM:DEUIDX", category: "indices" },
  { symbol: "FTSE", displayName: "FTSE 100", tradingViewSymbol: "FOREXCOM:UKXGBP", category: "indices" },
  { symbol: "N225", displayName: "Nikkei 225", tradingViewSymbol: "INDEX:NKY", category: "indices" },
]

interface AssetSearchProps {
  onSelect: (asset: Asset) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AssetSearch({ onSelect, isOpen, onOpenChange }: AssetSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("popular")

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

  // Reset search and tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("")
      setActiveTab("popular")
    }
  }, [isOpen])

  // Filtrar ativos populares
  const popularAssets = AVAILABLE_ASSETS.filter((asset) => asset.popular)

  // Função para filtrar ativos por categoria
  const getAssetsByCategory = (category: Asset["category"] | "all" | "popular") => {
    if (category === "popular") {
      return popularAssets.filter(
        (asset) =>
          searchTerm === "" ||
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return AVAILABLE_ASSETS.filter(
      (asset) =>
        (category === "all" || asset.category === category) &&
        !asset.popular &&
        (searchTerm === "" ||
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.displayName.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  // Função para obter a cor de fundo do ativo com base na categoria
  function getAssetBgColor(category: string) {
    switch (category) {
      case "crypto":
        return "bg-blue-50 dark:bg-blue-950/30"
      case "forex":
        return "bg-green-50 dark:bg-green-950/30"
      case "stocks":
        return "bg-indigo-50 dark:bg-indigo-950/30"
      case "commodities":
        return "bg-amber-50 dark:bg-amber-950/30"
      case "indices":
        return "bg-red-50 dark:bg-red-950/30"
      default:
        return "bg-gray-50 dark:bg-gray-800/30"
    }
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange} className="max-w-full sm:max-w-lg">
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Digite o nome ou símbolo do ativo..."
          onValueChange={setSearchTerm}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          autoFocus
        />
        {searchTerm && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchTerm("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Category tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start px-2 pt-2 pb-0 overflow-x-auto">
          <TabsTrigger value="popular" className="text-xs flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            Mais Negociados
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">
            Todos
          </TabsTrigger>
          <TabsTrigger value="crypto" className="text-xs">
            Cripto
          </TabsTrigger>
          <TabsTrigger value="forex" className="text-xs">
            Forex
          </TabsTrigger>
          <TabsTrigger value="stocks" className="text-xs">
            Ações
          </TabsTrigger>
          <TabsTrigger value="commodities" className="text-xs">
            Commodities
          </TabsTrigger>
          <TabsTrigger value="indices" className="text-xs">
            Índices
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <CommandList className="max-h-[400px] overflow-y-auto">
        <CommandEmpty>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Search className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Nenhum ativo encontrado</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">Tente pesquisar por outro termo ou categoria</p>
          </div>
        </CommandEmpty>

        {/* Popular assets */}
        {activeTab === "popular" && getAssetsByCategory("popular").length > 0 && (
          <CommandGroup heading="Mais Negociados">
            {getAssetsByCategory("popular").map((asset) => (
              <CommandItem
                key={asset.symbol}
                value={asset.symbol}
                onSelect={() => {
                  onSelect(asset)
                  onOpenChange?.(false)
                }}
                className="flex items-center px-2 py-1.5"
              >
                <div
                  className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${getAssetBgColor(asset.category)}`}
                >
                  <AssetIcon symbol={asset.symbol} category={asset.category} size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{asset.symbol}</span>
                  <span className="text-xs text-muted-foreground">{asset.displayName}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Show assets based on active tab */}
        {(activeTab === "all" || activeTab === "crypto") &&
          getAssetsByCategory(activeTab === "all" ? "crypto" : activeTab).length > 0 && (
            <>
              <CommandGroup heading="Criptomoedas">
                {getAssetsByCategory(activeTab === "all" ? "crypto" : activeTab).map((asset) => (
                  <CommandItem
                    key={asset.symbol}
                    value={asset.symbol}
                    onSelect={() => {
                      onSelect(asset)
                      onOpenChange?.(false)
                    }}
                    className="flex items-center px-2 py-1.5"
                  >
                    <div
                      className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${getAssetBgColor(asset.category)}`}
                    >
                      <AssetIcon symbol={asset.symbol} category={asset.category} size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">{asset.displayName}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

        {/* Forex */}
        {(activeTab === "all" || activeTab === "forex") &&
          getAssetsByCategory(activeTab === "all" ? "forex" : activeTab).length > 0 && (
            <>
              <CommandGroup heading="Forex">
                {getAssetsByCategory(activeTab === "all" ? "forex" : activeTab).map((asset) => (
                  <CommandItem
                    key={asset.symbol}
                    value={asset.symbol}
                    onSelect={() => {
                      onSelect(asset)
                      onOpenChange?.(false)
                    }}
                    className="flex items-center px-2 py-1.5"
                  >
                    <div
                      className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${getAssetBgColor(asset.category)}`}
                    >
                      <AssetIcon symbol={asset.symbol} category={asset.category} size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">{asset.displayName}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

        {/* Stocks */}
        {(activeTab === "all" || activeTab === "stocks") &&
          getAssetsByCategory(activeTab === "all" ? "stocks" : activeTab).length > 0 && (
            <>
              <CommandGroup heading="Ações">
                {getAssetsByCategory(activeTab === "all" ? "stocks" : activeTab).map((asset) => (
                  <CommandItem
                    key={asset.symbol}
                    value={asset.symbol}
                    onSelect={() => {
                      onSelect(asset)
                      onOpenChange?.(false)
                    }}
                    className="flex items-center px-2 py-1.5"
                  >
                    <div
                      className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${getAssetBgColor(asset.category)}`}
                    >
                      <AssetIcon symbol={asset.symbol} category={asset.category} size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">{asset.displayName}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

        {/* Commodities */}
        {(activeTab === "all" || activeTab === "commodities") &&
          getAssetsByCategory(activeTab === "all" ? "commodities" : activeTab).length > 0 && (
            <>
              <CommandGroup heading="Commodities">
                {getAssetsByCategory(activeTab === "all" ? "commodities" : activeTab).map((asset) => (
                  <CommandItem
                    key={asset.symbol}
                    value={asset.symbol}
                    onSelect={() => {
                      onSelect(asset)
                      onOpenChange?.(false)
                    }}
                    className="flex items-center px-2 py-1.5"
                  >
                    <div
                      className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${getAssetBgColor(asset.category)}`}
                    >
                      <AssetIcon symbol={asset.symbol} category={asset.category} size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">{asset.displayName}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

        {/* Indices */}
        {(activeTab === "all" || activeTab === "indices") &&
          getAssetsByCategory(activeTab === "all" ? "indices" : activeTab).length > 0 && (
            <>
              <CommandGroup heading="Índices">
                {getAssetsByCategory(activeTab === "all" ? "indices" : activeTab).map((asset) => (
                  <CommandItem
                    key={asset.symbol}
                    value={asset.symbol}
                    onSelect={() => {
                      onSelect(asset)
                      onOpenChange?.(false)
                    }}
                    className="flex items-center px-2 py-1.5"
                  >
                    <div
                      className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${getAssetBgColor(asset.category)}`}
                    >
                      <AssetIcon symbol={asset.symbol} category={asset.category} size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">{asset.displayName}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
      </CommandList>
    </CommandDialog>
  )
}

