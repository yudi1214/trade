// utils/authHelper.js

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} true se estiver autenticado, false caso contrário
 */
export const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    return !!token;
  };
  
  /**
   * Obtém o token de autenticação
   * @returns {string|null} Token JWT ou null se não estiver autenticado
   */
  export const getToken = () => {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('token');
  };
  
  /**
   * Obtém o ID do usuário do localStorage
   * @returns {string|null} ID do usuário ou null se não estiver disponível
   */
  export const getUserId = () => {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('userId');
  };
  
  /**
   * Salva informações de login no localStorage
   * @param {string} token - Token JWT
   * @param {Object} user - Dados do usuário
   */
  export const setUserSession = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userData', JSON.stringify(user));
  };
  
  /**
   * Limpa a sessão do usuário
   */
  export const clearUserSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
  };
  
  /**
   * Obtém os dados do usuário do localStorage
   * @returns {Object|null} Dados do usuário ou null se não estiver disponível
   */
  export const getUserData = () => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Erro ao analisar dados do usuário:', error);
      return null;
    }
  };