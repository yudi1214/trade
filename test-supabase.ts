import 'dotenv/config'; // Adicione esta linha no início
import { supabase } from './lib/supabase';

async function testSupabaseConnection() {
  try {
    console.log('Testando conexão com o Supabase...');
    console.log('URL do Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Teste simples: contar usuários
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Conexão com o Supabase bem-sucedida!');
    console.log(`Número de usuários no banco: ${count}`);
    
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

testSupabaseConnection();