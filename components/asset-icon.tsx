"use client"

import { Star } from "lucide-react"
import { useState } from "react"

interface AssetIconProps {
  symbol: string
  category: string
  isFavorite?: boolean
  size?: number
  className?: string
}

export function AssetIcon({ symbol, category, isFavorite = false, size = 16, className = "" }: AssetIconProps) {
  const [imageError, setImageError] = useState(false)

  // If it's a favorite, show star icon
  if (isFavorite) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      </div>
    )
  }

  // If image previously failed, show fallback immediately
  if (imageError) {
    return renderFallbackIcon(category, size, className)
  }

  // Get base symbol (before slash or dot)
  const baseSymbol = symbol.split("/")[0].split(".")[0]

  // Try to get an icon URL based on the category and symbol
  const iconUrl = getCategoryBasedIconUrl(category, symbol, baseSymbol)

  if (iconUrl) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={iconUrl || "/placeholder.svg"}
          alt={symbol}
          width={size}
          height={size}
          className="object-contain w-full h-full"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  // If no icon URL is found, render fallback
  return renderFallbackIcon(category, size, className)
}

// Function to get category-specific icon URLs
function getCategoryBasedIconUrl(category: string, fullSymbol: string, baseSymbol: string): string | null {
  switch (category) {
    case "crypto":
      return getCryptoIconUrl(baseSymbol)
    case "forex":
      return getForexIconUrl(fullSymbol)
    case "stocks":
      return getStockIconUrl(baseSymbol)
    case "commodities":
      return getCommodityIconUrl(baseSymbol)
    case "indices":
      return getIndexIconUrl(baseSymbol)
    default:
      return null
  }
}

// Crypto icons
function getCryptoIconUrl(symbol: string): string {
  const cryptoIcons: Record<string, string> = {
    BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
    XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
    ADA: "https://cryptologos.cc/logos/cardano-ada-logo.png",
    DOGE: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
    DOT: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png",
    LINK: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    MATIC: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    AVAX: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    UNI: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    AAVE: "https://cryptologos.cc/logos/aave-aave-logo.png",
    ATOM: "https://cryptologos.cc/logos/cosmos-atom-logo.png",
    LTC: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
    BCH: "https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png",
    ALGO: "https://cryptologos.cc/logos/algorand-algo-logo.png",
    FIL: "https://cryptologos.cc/logos/filecoin-fil-logo.png",
    NEAR: "https://cryptologos.cc/logos/near-protocol-near-logo.png",
    APE: "https://cryptologos.cc/logos/apecoin-ape-logo.png",
    SHIB: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
  }

  return cryptoIcons[symbol] || `/placeholder.svg?height=${16}&width=${16}`
}

// Forex icons
function getForexIconUrl(symbol: string): string {
  // Extract currency codes from forex pair
  const [base, quote] = symbol.split("/")

  const currencyFlags: Record<string, string> = {
    USD: "https://flagcdn.com/w80/us.png",
    EUR: "https://flagcdn.com/w80/eu.png",
    GBP: "https://flagcdn.com/w80/gb.png",
    JPY: "https://flagcdn.com/w80/jp.png",
    AUD: "https://flagcdn.com/w80/au.png",
    CAD: "https://flagcdn.com/w80/ca.png",
    CHF: "https://flagcdn.com/w80/ch.png",
    NZD: "https://flagcdn.com/w80/nz.png",
  }

  // Prefer base currency icon, fall back to quote
  return currencyFlags[base] || currencyFlags[quote] || `/placeholder.svg?height=${16}&width=${16}`
}

// Stock icons
function getStockIconUrl(symbol: string): string {
  const stockLogos: Record<string, string> = {
    AAPL: "https://logo.clearbit.com/apple.com",
    MSFT: "https://logo.clearbit.com/microsoft.com",
    GOOGL: "https://logo.clearbit.com/google.com",
    GOOG: "https://logo.clearbit.com/google.com",
    AMZN: "https://logo.clearbit.com/amazon.com",
    META: "https://logo.clearbit.com/meta.com",
    TSLA: "https://logo.clearbit.com/tesla.com",
    NVDA: "https://logo.clearbit.com/nvidia.com",
    JPM: "https://logo.clearbit.com/jpmorganchase.com",
    V: "https://logo.clearbit.com/visa.com",
    WMT: "https://logo.clearbit.com/walmart.com",
    MCD: "https://logo.clearbit.com/mcdonalds.com", // Added McDonald's logo
    PETR4: "https://logo.clearbit.com/petrobras.com.br",
    VALE3: "https://logo.clearbit.com/vale.com",
    ITUB4: "https://logo.clearbit.com/itau.com.br",
    BBDC4: "https://logo.clearbit.com/bradesco.com.br",
    ABEV3: "https://logo.clearbit.com/ambev.com.br",
  }

  return stockLogos[symbol] || `/placeholder.svg?height=${16}&width=${16}`
}

// Commodity icons
function getCommodityIconUrl(symbol: string): string {
  const commodityIcons: Record<string, string> = {
    GOLD: "https://img.icons8.com/color/96/gold-bars.png",
    SILVER: "https://img.icons8.com/color/96/silver-bars.png",
    OIL: "https://img.icons8.com/color/96/oil-barrel.png",
    "OIL.WTI": "https://img.icons8.com/color/96/oil-barrel.png",
    "OIL.BRENT": "https://img.icons8.com/color/96/oil-barrel.png",
    NATGAS: "https://img.icons8.com/color/96/gas-industry.png",
    COPPER: "https://img.icons8.com/color/96/copper.png",
  }

  return commodityIcons[symbol] || `/placeholder.svg?height=${16}&width=${16}`
}

// Index icons
function getIndexIconUrl(symbol: string): string {
  const indexIcons: Record<string, string> = {
    SPX: "https://img.icons8.com/color/96/stocks-growth.png",
    NDX: "https://logo.clearbit.com/nasdaq.com",
    DJI: "https://logo.clearbit.com/dowjones.com",
    IBOV: "https://logo.clearbit.com/b3.com.br",
    DAX: "https://logo.clearbit.com/deutsche-boerse.com",
    FTSE: "https://logo.clearbit.com/ftse.com",
    N225: "https://logo.clearbit.com/jpx.co.jp",
  }

  return indexIcons[symbol] || `/placeholder.svg?height=${16}&width=${16}`
}

// Render fallback icon based on category
function renderFallbackIcon(category: string, size: number, className: string) {
  const bgColorClass = getCategoryBgColorClass(category)
  const textColorClass = getCategoryTextColorClass(category)

  return (
    <div
      className={`flex items-center justify-center rounded-full ${bgColorClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <span className={`text-xs font-bold ${textColorClass}`}>{getCategoryInitial(category)}</span>
    </div>
  )
}

// Get background color class based on category
function getCategoryBgColorClass(category: string): string {
  switch (category) {
    case "crypto":
      return "bg-blue-100 dark:bg-blue-900/30"
    case "forex":
      return "bg-green-100 dark:bg-green-900/30"
    case "stocks":
      return "bg-indigo-100 dark:bg-indigo-900/30"
    case "commodities":
      return "bg-amber-100 dark:bg-amber-900/30"
    case "indices":
      return "bg-red-100 dark:bg-red-900/30"
    default:
      return "bg-gray-100 dark:bg-gray-800/30"
  }
}

// Get text color class based on category
function getCategoryTextColorClass(category: string): string {
  switch (category) {
    case "crypto":
      return "text-blue-600 dark:text-blue-400"
    case "forex":
      return "text-green-600 dark:text-green-400"
    case "stocks":
      return "text-indigo-600 dark:text-indigo-400"
    case "commodities":
      return "text-amber-600 dark:text-amber-400"
    case "indices":
      return "text-red-600 dark:text-red-400"
    default:
      return "text-gray-600 dark:text-gray-400"
  }
}

// Get initial letter for fallback icon
function getCategoryInitial(category: string): string {
  switch (category) {
    case "crypto":
      return "C"
    case "forex":
      return "F"
    case "stocks":
      return "S"
    case "commodities":
      return "C"
    case "indices":
      return "I"
    default:
      return "A"
  }
}

