"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import Script from "next/script"
import { useAssetContext } from "./asset-tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, CandlestickChart, LineChart, TrendingUp, Maximize2, Minimize2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Tipos de velas disponíveis
type ChartStyle = "1" | "0" | "2" | "3" | "8"

// Mapeamento de estilos para nomes legíveis
const chartStyleNames = {
  "1": "Candles",
  "0": "Barras",
  "2": "Linha",
  "3": "Área",
  "8": "Baseline",
} as const

// Mapeamento de intervalos para nomes legíveis
const intervalNames = {
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1h",
  "240": "4h",
  D: "1d",
  W: "1w",
} as const

export function TradingView() {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentSymbol } = useAssetContext()
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const widgetRef = useRef<any>(null)
  const [chartStyle, setChartStyle] = useState<ChartStyle>("1")
  const [interval, setInterval] = useState("15")
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Cleanup function to safely remove the widget
  const cleanupWidget = useCallback(() => {
    if (widgetRef.current) {
      try {
        widgetRef.current.remove()
      } catch (e) {
        console.error("Error cleaning up widget:", e)
      }
      widgetRef.current = null
    }
  }, [])

  const createWidget = useCallback(() => {
    // Safety check for DOM and TradingView
    if (!containerRef.current || !window.TradingView || !document.getElementById("tradingview_widget")) {
      return
    }

    // Cleanup previous instance
    cleanupWidget()

    try {
      widgetRef.current = new window.TradingView.widget({
        symbol: currentSymbol,
        interval: interval,
        timezone: "Etc/UTC",
        theme: theme === "dark" ? "dark" : "light",
        style: chartStyle,
        locale: "pt_BR",
        toolbar_bg: theme === "dark" ? "#1E1E1E" : "#ffffff",
        enable_publishing: false,
        withdateranges: false, // Desabilitar seletor de datas padrão
        hide_side_toolbar: false,
        allow_symbol_change: true,
        container_id: "tradingview_widget",
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        autosize: true,

        enabled_features: [
          "header_widget",
          "header_chart_type",
          "header_indicators",
          "header_compare",
          "header_undo_redo",
          "header_screenshot",
          "header_saveload",
          "left_toolbar",
          "control_bar",
          "timeframes_toolbar",
          "use_localstorage_for_settings",
        ],

        disabled_features: [
          "create_volume_indicator_by_default",
          "multiple_charts_by_default",
          "same_data_requery",
          "side_toolbar_in_fullscreen_mode",
          "header_symbol_search",
          "header_interval_dialog_button",
          "show_interval_dialog_on_key_press",
          "header_toolbar_chart_type",
        ],

        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#26a69a",
          "mainSeriesProperties.candleStyle.downColor": "#ef5350",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
          "mainSeriesProperties.candleStyle.drawBorder": true,
          "mainSeriesProperties.showCountdown": true,
          "paneProperties.background": theme === "dark" ? "#131722" : "#ffffff",
          "paneProperties.vertGridProperties.color": theme === "dark" ? "#363c4e" : "#e1e3eb",
          "paneProperties.horzGridProperties.color": theme === "dark" ? "#363c4e" : "#e1e3eb",
        },

        charts_storage_url: "https://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        client_id: "tradingview.com",
        user_id: "public_user",
        loading_screen: {
          backgroundColor: theme === "dark" ? "#131722" : "#ffffff",
          foregroundColor: theme === "dark" ? "#363c4e" : "#e1e3eb",
        },
      })
    } catch (e) {
      console.error("Error creating TradingView widget:", e)
    }
  }, [currentSymbol, interval, theme, chartStyle, cleanupWidget])

  // Handle script load
  useEffect(() => {
    if (isScriptLoaded && containerRef.current) {
      createWidget()
    }
  }, [isScriptLoaded, createWidget])

  // Handle component unmount
  useEffect(() => {
    return () => {
      cleanupWidget()
    }
  }, [cleanupWidget])

  // Handle fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }

    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isFullscreen])

  // Safe state updates
  const changeChartStyle = useCallback((style: ChartStyle) => {
    setChartStyle(style)
  }, [])

  const changeInterval = useCallback((newInterval: string) => {
    setInterval(newInterval)
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  return (
    <div className="relative w-full h-full">
      <Script
        src="https://s3.tradingview.com/tv.js"
        onLoad={() => setIsScriptLoaded(true)}
        strategy="afterInteractive"
      />

      {/* Controls bar - more compact on mobile */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-2 py-1 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {Object.entries(intervalNames).map(([value, label]) => (
            <Button
              key={value}
              variant={interval === value ? "default" : "ghost"}
              size="sm"
              className="h-6 px-2 text-xs font-medium"
              onClick={() => changeInterval(value)}
            >
              {label}
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-2" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={chartStyle === "1" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => changeChartStyle("1")}
                >
                  <CandlestickChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Candles</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={chartStyle === "0" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => changeChartStyle("0")}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Barras</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={chartStyle === "2" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => changeChartStyle("2")}
                >
                  <LineChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Linha</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={chartStyle === "3" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => changeChartStyle("3")}
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Área</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullscreen ? "Sair da tela cheia" : "Tela cheia"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div
        id="tradingview_widget"
        ref={containerRef}
        className="w-full h-full"
        style={{ visibility: isScriptLoaded ? "visible" : "hidden" }}
      />
    </div>
  )
}

