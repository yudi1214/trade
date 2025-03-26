interface TradingViewWidget {
    widget(configuration: unknown): void;
  }
  
  declare global {
    interface Window {
      TradingView: TradingViewWidget;
    }
  }
  
  export {};