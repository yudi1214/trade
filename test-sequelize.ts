import { testConnection } from './lib/db';
import { User, syncModels } from './lib/models';

async function testSequelize() {
  try {
    console.log('Testando conexão com o banco de dados...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Falha na conexão com o banco de dados.');
      return;
    }
    
    console.log('Sincronizando modelos...');
    await syncModels();
    
    console.log('Contando usuários...');
    const userCount = await User.count();
    console.log(`Número de usuários no banco: ${userCount}`);
    
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

testSequelize();