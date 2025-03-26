// services/tradeServices.ts
import axios from 'axios';

// Interfaces
export interface TradeData {
  userId: string;
  assetSymbol: string;
  amount: number;
  direction: 'UP' | 'DOWN';
  expirationMinutes: number;
}

export interface Trade {
  id: string;
  userId: string;
  assetSymbol: string;
  amount: number;
  direction: 'UP' | 'DOWN';
  entryPrice: number;
  exitPrice?: number;
  expirationTime: string;
  status: string;
  result: 'PENDING' | 'WIN' | 'LOSS';
  profit?: number;
  createdAt: string;
  updatedAt: string;
}

// Criar uma instância personalizada do axios com a URL base correta
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar o token em cada requisição
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    // Formato exato "Bearer <token>"
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token adicionado ao cabeçalho da requisição');
  } else {
    console.log('Token não encontrado no localStorage');
  }
  
  // Log da requisição
  console.log('Enviando requisição:', {
    método: config.method,
    url: config.url,
    dados: config.data,
    headers: {
      ...config.headers,
      Authorization: token ? 'Bearer <TOKEN>' : undefined // Não logar o token completo
    }
  });
  
  return config;
});

// Função para criar um novo trade
export const createTrade = async (tradeData: TradeData): Promise<Trade> => {
  try {
    console.log('Dados originais:', tradeData);
    
    // Usar os campos originais sem conversão
    const apiData = {
      userId: tradeData.userId,
      assetSymbol: tradeData.assetSymbol,
      amount: tradeData.amount,
      direction: tradeData.direction,
      expirationMinutes: tradeData.expirationMinutes
    };
    
    console.log('Dados a serem enviados ao backend:', apiData);
    const response = await api.post('/trades', apiData);
    console.log('Resposta do backend:', response.data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    throw new Error('Formato de resposta inesperado');
  } catch (error) {
    console.error('Erro completo ao criar trade:', error);
    
    if (axios.isAxiosError(error)) {
      console.log('Status do erro:', error.response?.status);
      console.log('Dados do erro:', error.response?.data);
    }
    
    throw error;
  }
};

// Função para obter trades de um usuário
export const getUserTrades = async (userId: string): Promise<Trade[]> => {
  try {
    console.log('Buscando trades para userId:', userId);
    
    // Tente os dois endpoints possíveis
    try {
      // Primeiro formato: /users/:userId/trades
      const response = await api.get(`/users/${userId}/trades`);
      console.log('Resposta dos trades (formato 1):', response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
    } catch (error) {
      console.log('Primeiro formato falhou, tentando o segundo...');
      
      // Segundo formato: /trades?userId=:userId
      const response = await api.get(`/trades?userId=${userId}`);
      console.log('Resposta dos trades (formato 2):', response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar trades do usuário:', error);
    return [];
  }
};

// Função para buscar um trade específico
export const getTrade = async (tradeId: string): Promise<Trade | null> => {
  try {
    console.log(`Buscando trade ${tradeId}`);
    
    const response = await api.get(`/trades/${tradeId}`);
    console.log('Resposta do trade:', response.data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao buscar trade ${tradeId}:`, error);
    return null;
  }
};