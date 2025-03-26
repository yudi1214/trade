import React, { useEffect, useState } from 'react';
import { tradeService } from '../api';

interface Trade {
  id: number;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  entryPrice: number;
  exitPrice: number | null;
  possibleProfit: number;
  profit: number;
  status: 'open' | 'closed';
  result: 'win' | 'loss' | null;
  createdAt: string;
  closedAt: string | null;
}

const TradesList: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrades();
    
    // Atualizar a lista a cada 30 segundos
    const interval = setInterval(loadTrades, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadTrades = async () => {
    try {
      const response = await tradeService.getTrades();
      setTrades(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar operações');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando operações...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (trades.length === 0) {
    return <div>Nenhuma operação encontrada.</div>;
  }

  return (
    <div className="trades-list">
      <h3>Suas Operações</h3>
      
      <table className="table">
        <thead>
          <tr>
            <th>Ativo</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Preço Entrada</th>
            <th>Preço Saída</th>
            <th>Status</th>
            <th>Resultado</th>
            <th>Lucro</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className={trade.result === 'win' ? 'success' : trade.result === 'loss' ? 'danger' : ''}>
              <td>{trade.symbol}</td>
              <td>{trade.type === 'buy' ? 'Compra (Alta)' : 'Venda (Baixa)'}</td>
              <td>R$ {trade.amount.toFixed(2)}</td>
              <td>{trade.entryPrice.toFixed(2)}</td>
              <td>{trade.exitPrice ? trade.exitPrice.toFixed(2) : '-'}</td>
              <td>{trade.status === 'open' ? 'Aberta' : 'Fechada'}</td>
              <td>
                {trade.result === 'win' ? 'Ganhou' : 
                 trade.result === 'loss' ? 'Perdeu' : 
                 '-'}
              </td>
              <td>
                {trade.result === 'win' ? `+R$ ${trade.profit.toFixed(2)}` : 
                 trade.result === 'loss' ? `-R$ ${trade.amount.toFixed(2)}` : 
                 '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradesList;