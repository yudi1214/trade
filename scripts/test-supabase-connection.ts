// scripts/test-supabase-connection.ts
import { supabase } from "../lib/supabase"

async function testSupabaseConnection() {
  try {
    console.log("Testando conexão com o Supabase...")
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "Usando valor padrão")
    
    // Verificar se as variáveis de ambiente estão definidas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("⚠️ Variáveis de ambiente do Supabase não detectadas!")
      console.warn("Usando valores padrão definidos no arquivo lib/supabase.ts")
    }

    // Tentar fazer uma consulta simples
    const { data, error } = await supabase
      .from("xgate_customer_mapping")
      .select("*")
      .limit(1)

    if (error) {
      throw error
    }

    console.log("✅ Conexão com o Supabase estabelecida com sucesso!")
    console.log("Dados recebidos:", data)

    // Verificar se as tabelas existem
    console.log("\nVerificando tabelas...")
    
    // Verificar tabela xgate_customer_mapping
    const { data: mappingData, error: mappingError } = await supabase
      .from("xgate_customer_mapping")
      .select("*")
      .limit(1)
    
    if (mappingError) {
      console.error("❌ Erro ao verificar tabela xgate_customer_mapping:", mappingError.message)
      return false
    }
    console.log("✅ Tabela xgate_customer_mapping está acessível")
    
    // Verificar tabela transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .limit(1)
    
    if (transactionsError) {
      console.error("❌ Erro ao verificar tabela transactions:", transactionsError.message)
      return false
    }
    console.log("✅ Tabela transactions está acessível")
    
    // Verificar tabela webhook_logs
    const { data: webhookData, error: webhookError } = await supabase
      .from("webhook_logs")
      .select("*")
      .limit(1)
    
    if (webhookError) {
      console.error("❌ Erro ao verificar tabela webhook_logs:", webhookError.message)
      return false
    }
    console.log("✅ Tabela webhook_logs está acessível")

    console.log("\n✅ Todas as tabelas estão configuradas corretamente!")
    return true
  } catch (error) {
    console.error("❌ Erro ao conectar com o Supabase:", error)
    return false
  }
}

// Executar o teste
console.log("=== TESTE DE CONEXÃO COM O SUPABASE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

testSupabaseConnection()
  .then((success) => {
    console.log("\n=== RESUMO ===")
    if (success) {
      console.log("✅ Conexão com o Supabase estabelecida com sucesso!")
      console.log("✅ Todas as tabelas estão configuradas corretamente!")
      console.log("Você pode prosseguir com os testes de depósito PIX.")
    } else {
      console.log("❌ Falha ao conectar com o Supabase ou verificar tabelas.")
      console.log("Verifique as mensagens de erro acima e corrija os problemas antes de continuar.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o teste:", err)
    console.error("===============================")
  })