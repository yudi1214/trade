// services/axios-config.js
import axios from 'axios';

// Criar uma instância do axios com uma URL base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// Interceptor para adicionar o token JWT a todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Não fazer logout automático em erros 401
    // Apenas retornar o erro para ser tratado pelo componente
    return Promise.reject(error);
  }
);

export default api;