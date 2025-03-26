// utils/authDebug.ts
export const debugAuth = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    console.log('======= DEBUG AUTENTICAÇÃO =======');
    console.log('Token presente:', token ? 'Sim' : 'Não');
    console.log('UserId armazenado:', userId);
    
    if (token) {
      try {
        // Decode JWT (parte do payload apenas)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join('')
        );
        
        const payload = JSON.parse(jsonPayload);
        console.log('Conteúdo do token:', payload);
        console.log('Token expirado:', payload.exp * 1000 < Date.now() ? 'Sim' : 'Não');
        
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          console.log('Data de expiração:', expDate.toLocaleString());
        }
      } catch (e) {
        console.log('Erro ao decodificar token:', e);
      }
    }
    console.log('==================================');
  };
  
  // Exporta uma função para ser chamada quando necessário
  export const testAuthEndpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('Teste de autenticação:', data);
      return data;
    } catch (error) {
      console.error('Erro no teste de autenticação:', error);
      return null;
    }
  };