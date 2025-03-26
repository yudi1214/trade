import React, { useState } from 'react';
import { tradeService } from '../api';

interface TradingFormProps {
  currentPrice: number;
  symbol: string;
  onTradeCreated: (trade: any) => void;
}

const TradingForm: React.FC<TradingFormProps> = ({ currentPrice, symbol, onTradeCreated }) => {
  const [amount, setAmount] = useState<number>(10);
  const [expiration, setExpiration] = useState<number>(1);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await tradeService.createTrade(
        symbol,
        type,
        amount,
        expiration,
        currentPrice
      );

      onTradeCreated(response.data);
      
      // Configurar timer para finalizar a operação
      setTimeout(() => {
        finishTrade(response.data.id);
      }, expiration * 60 * 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar operação');
    } finally {
      setLoading(false);
    }
  };

  const finishTrade = async (tradeId: number) => {
    try {
      // Aqui você obteria o preço atual do TradingView
      const finalPrice = window.currentPrice || currentPrice;
      
      await tradeService.finishTrade(tradeId, finalPrice);
      
      // Atualizar a lista de operações
      // Isso depende da sua implementação
    } catch (err) {
      console.error('Erro ao finalizar operação:', err);
    }
  };

  return (
    <div className="trading-form">
      <h3>Nova Operação</h3>
      <p>Preço atual: {currentPrice}</p>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Operação</label>
          <div className="button-group">
            <button
              type="button"
              className={`btn ${type === 'buy' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setType('buy')}
            >
              Compra (Alta)
            </button>
            <button
              type="button"
              className={`btn ${type === 'sell' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setType('sell')}
            >
              Venda (Baixa)
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label>Valor (R$)</label>
          <input
            type="number"
            min="10"
            step="10"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Tempo de Expiração (minutos)</label>
          <select
            value={expiration}
            onChange={(e) => setExpiration(Number(e.target.value))}
            className="form-control"
          >
            <option value="1">1 minuto</option>
            <option value="5">5 minutos</option>
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="60">1 hora</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="btn btn-success btn-block"
          disabled={loading}
        >
          {loading ? 'Processando...' : 'Confirmar Operação'}
        </button>
      </form>
    </div>
  );
};

export default TradingForm;