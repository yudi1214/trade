"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface CopyTraderFiltersProps {
  isOpen: boolean
  onClose: () => void
}

export function CopyTraderFilters({ isOpen, onClose }: CopyTraderFiltersProps) {
  const [winRate, setWinRate] = useState([60])
  const [minTrades, setMinTrades] = useState([50])
  const [profitRange, setProfitRange] = useState([20])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [timeFrame, setTimeFrame] = useState("30d")

  const handleReset = () => {
    setWinRate([60])
    setMinTrades([50])
    setProfitRange([20])
    setVerifiedOnly(false)
    setTimeFrame("30d")
  }

  const handleApply = () => {
    // Apply filters logic here
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Win Rate Mínimo</Label>
              <span className="text-sm font-medium">{winRate[0]}%</span>
            </div>
            <Slider value={winRate} min={0} max={100} step={1} onValueChange={setWinRate} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mínimo de Trades</Label>
              <span className="text-sm font-medium">{minTrades[0]}</span>
            </div>
            <Slider value={minTrades} min={0} max={500} step={10} onValueChange={setMinTrades} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>500+</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Lucro Mínimo</Label>
              <span className="text-sm font-medium">{profitRange[0]}%</span>
            </div>
            <Slider value={profitRange} min={-50} max={100} step={5} onValueChange={setProfitRange} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>-50%</span>
              <span>100%+</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="verified-only">Apenas Verificados</Label>
            <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
          </div>

          <div className="space-y-2">
            <Label>Período de Tempo</Label>
            <RadioGroup value={timeFrame} onValueChange={setTimeFrame}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7d" id="7d" />
                <Label htmlFor="7d">7 dias</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30d" id="30d" />
                <Label htmlFor="30d">30 dias</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="90d" id="90d" />
                <Label htmlFor="90d">90 dias</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Todo o período</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Resetar
          </Button>
          <Button onClick={handleApply}>Aplicar Filtros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

