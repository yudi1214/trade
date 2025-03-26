import React, { useState } from 'react';
import TradingViewChart from './TradingViewChart';
import TradingForm from './TradingForm';
import TradesList from './TradesList';

const TradingPage: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [symbol, setSymbol] = useState<string>('BTCUSD');

  const handlePriceUpdate = (price: number) => {
    setCurrentPrice(price);
  };

  const handleTradeCreated = (trade: any) => {
    // Atualizar a lista de operações
    // Você pode implementar isso de acordo com sua necessidade
  };

  return (
    <div className="trading-page">
      <div className="row">
        <div className="col-md-9">
          <TradingViewChart 
            symbol={symbol} 
            onPriceUpdate={handlePriceUpdate} 
          />
        </div>
        <div className="col-md-3">
          <TradingForm 
            currentPrice={currentPrice} 
            symbol={symbol}
            onTradeCreated={handleTradeCreated}
          />
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <TradesList />
        </div>
      </div>
    </div>
  );
};

export default TradingPage;