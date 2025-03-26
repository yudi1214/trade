"use client"

import React, { useEffect, useRef } from 'react';

export function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    
    script.onload = () => {
      if (window.TradingView && container.current) {
        new window.TradingView.widget({
          width: '100%',
          height: '600px',
          symbol: "BINANCE:BTCUSDT",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "br",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_chart",
        });
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      id="tradingview_chart" 
      ref={container} 
      style={{ height: '600px', width: '100%' }}
    />
  );
}