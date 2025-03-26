import axios from "axios"
import { supabase } from "../lib/supabase"

/**
 * Script para diagnosticar problemas com a página de depósito
 */
async function diagnoseDepositPage() {
  console.log("Iniciando diagnóstico da página de depósito...")

  // 1. Verificar conexão com o Supabase
  console.log("\n1. Verificando conexão com o Supabase...")
  try {
    const { data, error } = await supabase.from("transactions").select("*").limit(1)

    if (error) {
      console.error("❌ Erro ao conectar com o Supabase:", error.message)
      console.log("Isso pode estar causando problemas na página de depósito.")
      console.log("Verifique se as variáveis de ambiente do Supabase estão configuradas corretamente:")
      console.log("- NEXT_PUBLIC_SUPABASE_URL")
      console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY")
    } else {
      console.log("✅ Conexão com o Supabase estabelecida com sucesso!")
    }
  } catch (error) {
    console.error("❌ Erro ao testar conexão com o Supabase:", error)
  }

  // 2. Verificar se o servidor Next.js está rodando
  console.log("\n2. Verificando se o servidor Next.js está rodando...")
  try {
    await axios.get("http://localhost:3000/api/health", { timeout: 3000 })
    console.log("✅ Servidor Next.js está rodando!")
  } catch (error) {
    console.error("❌ Servidor Next.js não está respondendo ou não tem a rota /api/health")
    console.log("Certifique-se de que o servidor está rodando com 'npm run dev'")
    console.log("Se necessário, crie uma rota de saúde em app/api/health/route.ts")
  }

  // 3. Verificar se a API de depósito está funcionando
  console.log("\n3. Verificando se a API de depósito está funcionando...")
  try {
    const response = await axios.post(
      "http://localhost:3000/api/transactions/deposit",
      {
        amount: 100,
        bonus: 100,
      },
      { timeout: 5000 },
    )

    console.log("✅ API de depósito respondeu com sucesso!")
    console.log("Status:", response.status)
    console.log("Resposta:", response.data)
  } catch (error: any) {
    console.error("❌ Erro ao chamar a API de depósito")

    if (error.response) {
      console.error("Status:", error.response.status)
      console.error("Resposta:", error.response.data)
    } else if (error.request) {
      console.error("Sem resposta do servidor. Verifique se a rota está implementada corretamente.")
    } else {
      console.error("Erro:", error.message)
    }
  }

  // 4. Verificar variáveis de ambiente
  console.log("\n4. Verificando variáveis de ambiente...")
  const requiredEnvVars = ["XGATE_EMAIL", "XGATE_PASSWORD", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingEnvVars.length > 0) {
    console.error(`❌ Faltam as seguintes variáveis de ambiente: ${missingEnvVars.join(", ")}`)
    console.log("Isso pode estar causando problemas na página de depósito.")
  } else {
    console.log("✅ Todas as variáveis de ambiente necessárias estão definidas!")
  }

  console.log("\nDiagnóstico concluído!")
}

// Executar o diagnóstico
console.log("=== DIAGNÓSTICO DA PÁGINA DE DEPÓSITO ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

diagnoseDepositPage()
  .then(() => {
    console.log("\n=== RECOMENDAÇÕES ===")
    console.log("1. Verifique os logs do servidor Next.js para erros")
    console.log("2. Verifique o console do navegador para erros de JavaScript")
    console.log("3. Tente limpar o cache do Next.js: rm -rf .next && npm run dev")
    console.log("4. Verifique se seu IP está na whitelist da XGate")
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado:", err)
    console.error("===============================")
  })

