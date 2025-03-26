import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
    tvWidget: any;
    currentPrice: number;
  }
}

interface TradingViewChartProps {
  symbol: string;
  onPriceUpdate: (price: number) => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, onPriceUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = initTradingView;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (window.tvWidget) {
        window.tvWidget.remove();
        window.tvWidget = null;
      }
    };
  }, []);

  const initTradingView = () => {
    const widgetOptions = {
      symbol: symbol,
      interval: '1',
      container_id: containerRef.current?.id,
      datafeed: {
        // Configuração do datafeed
        // ...
      },
      library_path: 'https://s3.tradingview.com/charting_library/',
      locale: 'pt',
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user',
      autosize: true,
      studies_overrides: {},
      theme: 'Light'
    };

    window.tvWidget = new window.TradingView.widget(widgetOptions);

    window.tvWidget.onChartReady(() => {
      const chart = window.tvWidget.chart();
      
      // Capturar o preço quando o cursor se move
      chart.crossHairMoved(param => {
        if (param.price) {
          window.currentPrice = param.price;
          onPriceUpdate(param.price);
        }
      });
      
      // Também podemos capturar o último preço fechado
      const lastPrice = chart.lastPrice();
      if (lastPrice) {
        window.currentPrice = lastPrice;
        onPriceUpdate(lastPrice);
      }
    });
  };

  return <div id="tv_chart_container" ref={containerRef} style={{ height: '500px' }} />;
};

export default TradingViewChart;