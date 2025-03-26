import { supabase } from "../lib/supabase"

/**
 * Script para criar uma transação para um depósito existente
 * Leva em conta a estrutura real da tabela transactions
 */
async function createTransactionForDeposit(depositId: string, userId: string) {
  try {
    console.log("Verificando conexão com o Supabase...")
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("❌ Erro ao verificar usuário:", userError.message)
      return false
    }

    console.log("✅ Usuário encontrado:", userData.name, userData.email)

    // Verificar a estrutura da tabela transactions
    console.log("\nVerificando estrutura da tabela transactions...")
    const { data: transactionSample, error: sampleError } = await supabase.from("transactions").select("*").limit(1)

    if (sampleError) {
      console.error("❌ Erro ao verificar estrutura da tabela transactions:", sampleError.message)
      return false
    }

    if (!transactionSample || transactionSample.length === 0) {
      console.error("❌ Não foi possível determinar a estrutura da tabela transactions")
      return false
    }

    const sampleKeys = Object.keys(transactionSample[0])
    console.log("Estrutura da tabela transactions:", sampleKeys)

    // Preparar dados da transação com base na estrutura descoberta
    const transactionData: any = {
      user_id: userId,
      type: "deposit",
      amount: 100,
      status: "pending",
      date: new Date().toISOString(), // Coluna obrigatória que descobrimos
    }

    // Adicionar campos opcionais se existirem na estrutura
    if (sampleKeys.includes("reference")) {
      transactionData.reference = depositId
    }

    if (sampleKeys.includes("external_id")) {
      transactionData.external_id = depositId
    }

    if (sampleKeys.includes("details")) {
      transactionData.details = {
        id: depositId,
        customerId: "67de2322bbf0316b4edca8df", // ID do cliente padrão
        status: "WAITING_PAYMENT",
        amount: 100,
        currency: "BRL",
      }
    }

    console.log("\nInserindo transação:", transactionData)

    const { error: insertError } = await supabase.from("transactions").insert(transactionData)

    if (insertError) {
      console.error("❌ Erro ao inserir transação:", insertError.message)
      return false
    }

    console.log("✅ Transação inserida com sucesso!")
    return true
  } catch (error: any) {
    console.error("\n❌ Erro ao criar transação:")
    console.error("Erro:", error.message)
    return false
  }
}

// Obter parâmetros da linha de comando
const depositId = process.argv[2]
const userId = process.argv[3] || "7077a227-23ac-48e7-8ed0-2efa43602c6b" // ID do usuário que encontramos

if (!depositId) {
  console.error("❌ Erro: ID do depósito não fornecido!")
  console.error("Uso: npx ts-node scripts/create-transaction-for-deposit.ts ID_DO_DEPOSITO [ID_DO_USUARIO]")
  process.exit(1)
}

// Executar o script
console.log("=== CRIAÇÃO DE TRANSAÇÃO PARA DEPÓSITO ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

createTransactionForDeposit(depositId, userId)
  .then((success) => {
    console.log("\n=== RESUMO ===")
    if (success) {
      console.log("✅ Transação criada com sucesso!")
      console.log("ID do depósito:", depositId)
      console.log("ID do usuário:", userId)
      console.log("\nPróximos passos:")
      console.log("1. Inicie o servidor Next.js com: npm run dev")
      console.log("2. Simule um webhook com:")
      console.log(`npx ts-node scripts/simulate-webhook-for-user-updated.ts ${depositId} ${userId}`)
    } else {
      console.log("❌ Falha ao criar transação. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar o script:", err)
    console.error("===============================")
  })

