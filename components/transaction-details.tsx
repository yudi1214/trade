"use client"

import { X, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"

// Definindo uma interface para transação
interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  value: string;
  status: string;
  method: string;
  reference: string;
}

interface TransactionDetailsProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionDetails({ transaction, onClose }: TransactionDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">Detalhes da Transação</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">ID</p>
              <p className="font-medium">{transaction.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">{transaction.date}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                transaction.type === "Depósito"
                  ? "bg-green-100 text-green-800"
                  : transaction.type === "Retirada"
                  ? "bg-red-100 text-red-800"
                  : transaction.type === "Operação"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {transaction.type}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Descrição</p>
            <p className="font-medium">{transaction.description}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className={`font-medium ${transaction.value.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
              {transaction.value}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                transaction.status === "Concluído"
                  ? "bg-green-100 text-green-800"
                  : transaction.status === "Pendente"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {transaction.status}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Método</p>
            <p className="font-medium">{transaction.method}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Referência</p>
            <p className="font-medium">{transaction.reference}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={onClose}>
              <Download className="mr-2 h-4 w-4" />
              Baixar Recibo
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}