"use client"

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { transactionService } from '@/lib/api'

// Interface para a resposta da API
interface ApiTransaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  status: string;
  method?: string;
}

// Interface para transação formatada do frontend
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

interface TransactionsTableProps {
  onViewDetails: (transaction: Transaction) => void
}

export function TransactionsTable({ onViewDetails }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionService.getTransactions();
        
        // Mapear transações do backend para o formato do frontend
        const formattedTransactions = data.transactions.map((item: ApiTransaction) => {
            // Tratamento para método
            let methodLabel = 'Não especificado';
            
            // Usar uma maneira mais segura de acessar o método
            const method = item.method ? String(item.method) : '';
            
            // Determinar o rótulo do método
            switch (method) {
              case 'pix':
                methodLabel = 'PIX';
                break;
              case 'bank_transfer':
                methodLabel = 'Transferência Bancária';
                break;
              case 'trade':
                methodLabel = 'Operação';
                break;
              default:
                methodLabel = method || 'Não especificado';
            }
          
            // Determinar o tipo
            let typeLabel = 'Transação';
            switch (item.type) {
              case 'deposit':
                typeLabel = 'Depósito';
                break;
              case 'withdrawal':
                typeLabel = 'Retirada';
                break;
              case 'trade':
                typeLabel = 'Operação';
                break;
            }
            
            // Determinar descrição
            let descriptionText = 'Transação';
            switch (item.type) {
              case 'deposit':
                descriptionText = 'Depósito via PIX';
                break;
              case 'withdrawal':
                descriptionText = 'Retirada para conta bancária';
                break;
              case 'trade':
                descriptionText = 'Operação de Trading';
                break;
            }
            
            // Determinar status
            let statusLabel = 'Status Desconhecido';
            switch (item.status) {
              case 'pending':
                statusLabel = 'Pendente';
                break;
              case 'completed':
                statusLabel = 'Concluído';
                break;
              case 'failed':
                statusLabel = 'Cancelado';
                break;
            }
          
            return {
              id: String(item.id),
              date: new Date(item.date).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short'
              }),
              type: typeLabel,
              description: descriptionText,
              value: item.type === 'deposit' 
                ? `+ R$ ${item.amount.toFixed(2)}` 
                : `- R$ ${item.amount.toFixed(2)}`,
              status: statusLabel,
              method: methodLabel,
              reference: String(item.id) // Usando ID como referência
            };
          });

        setTransactions(formattedTransactions);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar transações:', err);
        setError('Erro ao carregar transações');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div>Carregando transações...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Descrição</th>
                <th className="px-4 py-3 text-left font-medium">Valor</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b">
                  <td className="px-4 py-3">{transaction.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === "Depósito"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : transaction.type === "Retirada"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : transaction.type === "Operação"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{transaction.description}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      transaction.value.startsWith("+") ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {transaction.value}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === "Concluído"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : transaction.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(transaction)}>
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
        <div className="text-sm text-muted-foreground">Página 1 de 2</div>
        <Button variant="outline" size="sm">
          Próxima
        </Button>
      </div>
    </div>
  )
}