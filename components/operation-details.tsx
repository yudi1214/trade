"use client"

import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

// Definindo um tipo para operação
interface Operation {
  id: string;
  date: string;
  asset: string;
  type: string;
  value: string;
  entry: string;
  exit: string;
  profit: string;
  result: string;
}

interface OperationDetailsProps {
  operation: Operation;
  onClose: () => void;
}

export function OperationDetails({ operation, onClose }: OperationDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">Detalhes da Operação</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">ID</p>
              <p className="font-medium">{operation.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">{operation.date}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Ativo</p>
            <p className="font-medium">{operation.asset}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                operation.type === "Compra" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {operation.type}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="font-medium">{operation.value}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço de Entrada</p>
              <p className="font-medium">{operation.entry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preço de Saída</p>
              <p className="font-medium">{operation.exit}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tempo de Expiração</p>
            <p className="font-medium">30 minutos</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Lucro/Perda</p>
            <p className={`font-medium ${operation.profit.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
              {operation.profit}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Resultado</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                operation.result === "Ganho"
                  ? "bg-green-100 text-green-800"
                  : operation.result === "Perda"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {operation.result}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Observações</p>
            <p className="text-sm">Tendência de alta confirmada por suporte em 1.0850</p>
          </div>
        </div>
      </div>
    </div>
  )
}