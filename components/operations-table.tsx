"use client"

import { Search } from 'lucide-react'
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

const operations: Operation[] = [
  {
    id: "OP00123",
    date: "15/02/2025, 14:30",
    asset: "EUR/USD",
    type: "Compra",
    value: "R$ 100.00",
    entry: "1.0857",
    exit: "1.0870",
    profit: "+ R$ 87.00",
    result: "Ganho",
  },
  {
    id: "OP00122",
    date: "14/02/2025, 10:15",
    asset: "BTC/USD",
    type: "Venda",
    value: "R$ 200.00",
    entry: "42800.00",
    exit: "41800.00",
    profit: "+ R$ 174.00",
    result: "Ganho",
  },
  {
    id: "OP00121",
    date: "13/02/2025, 16:45",
    asset: "USD/JPY",
    type: "Compra",
    value: "R$ 150.00",
    entry: "145.78",
    exit: "145.65",
    profit: "- R$ 150.00",
    result: "Perda",
  },
  // ... adicione mais operações conforme necessário
]

interface OperationsTableProps {
  onViewDetails: (operation: Operation) => void
}

export function OperationsTable({ onViewDetails }: OperationsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Histórico de Operações</h2>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Ativo</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Valor</th>
                <th className="px-4 py-3 text-left font-medium">Entrada</th>
                <th className="px-4 py-3 text-left font-medium">Saída</th>
                <th className="px-4 py-3 text-left font-medium">Lucro/Perda</th>
                <th className="px-4 py-3 text-left font-medium">Resultado</th>
                <th className="px-4 py-3 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((operation) => (
                <tr key={operation.id} className="border-b">
                  <td className="px-4 py-3">{operation.date}</td>
                  <td className="px-4 py-3 font-medium">{operation.asset}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        operation.type === "Compra" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {operation.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{operation.value}</td>
                  <td className="px-4 py-3">{operation.entry}</td>
                  <td className="px-4 py-3">{operation.exit}</td>
                  <td className={`px-4 py-3 ${operation.profit.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {operation.profit}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(operation)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm">
          Anterior
        </Button>
        <div className="text-sm text-muted-foreground">Página 1 de 1</div>
        <Button variant="outline" size="sm">
          Próxima
        </Button>
      </div>
    </div>
  )
}