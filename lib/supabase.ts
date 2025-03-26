import { createClient } from "@supabase/supabase-js"

// Usar as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lhfueuumsligayesgewy.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZnVldXVtc2xpZ2F5ZXNnZXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NzQzNzUsImV4cCI6MjA1ODE1MDM3NX0.vif02jcX4zx5MtOHipilhfsba_TNQGOOjREntkmFgLQ"

// Criar e exportar o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// Função para verificar a conexão com o Supabase
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("xgate_customer_mapping").select("count(*)").limit(1)
    
    if (error) {
      console.error("Erro ao conectar com o Supabase:", error.message)
      return false
    }
    
    console.log("Conexão com o Supabase estabelecida com sucesso!")
    return true
  } catch (error) {
    console.error("Erro ao verificar conexão com o Supabase:", error)
    return false
  }
}