import { supabase } from "../lib/supabase"

/**
 * Script para criar um usuário de teste no Supabase
 */
async function createTestUser() {
  try {
    console.log("Verificando conexão com o Supabase...")
    const { data: testData, error: testError } = await supabase.from("users").select("*").limit(1)

    if (testError) {
      console.error("❌ Erro ao conectar com o Supabase:", testError.message)
      console.error("Verifique se as variáveis de ambiente estão configuradas corretamente.")
      return false
    }

    console.log("✅ Conexão com o Supabase estabelecida!")

    // Verificar se a tabela users existe
    console.log("\nVerificando se a tabela users existe...")
    try {
      const { data: usersData, error: usersError } = await supabase.from("users").select("*").limit(1)

      if (usersError) {
        console.error("❌ Erro ao acessar tabela users:", usersError.message)
        return false
      }

      console.log("✅ Tabela users existe!")

      if (usersData && usersData.length > 0) {
        console.log("Estrutura da tabela users:")
        console.log("Colunas:", Object.keys(usersData[0]))
      }
    } catch (e) {
      console.error("❌ Erro ao verificar tabela users:", e)
      return false
    }

    // Criar usuário de teste
    console.log("\nCriando usuário de teste...")

    // Gerar UUID aleatório
    const userId = crypto.randomUUID()

    const userData = {
      id: userId,
      name: "Usuário de Teste",
      email: "teste@example.com",
      realBalance: 0,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("users").insert(userData).select()

    if (error) {
      console.error("❌ Erro ao criar usuário de teste:", error.message)

      // Verificar se o erro é de chave duplicada
      if (error.message.includes("duplicate key")) {
        console.log("⚠️ Um usuário com este ID ou email já existe.")

        // Buscar usuários existentes
        console.log("\nBuscando usuários existentes...")
        const { data: existingUsers, error: searchError } = await supabase.from("users").select("*").limit(5)

        if (searchError) {
          console.error("❌ Erro ao buscar usuários existentes:", searchError.message)
        } else if (existingUsers && existingUsers.length > 0) {
          console.log("✅ Usuários existentes encontrados:")
          existingUsers.forEach((user, index) => {
            console.log(`[${index + 1}] ID: ${user.id}, Nome: ${user.name}, Email: ${user.email}`)
          })

          console.log("\nVocê pode usar um destes IDs para os testes.")
          return true
        }
      }

      return false
    }

    console.log("✅ Usuário de teste criado com sucesso!")
    console.log("ID do usuário:", userId)
    console.log("\nUse este ID nos scripts de teste.")

    return true
  } catch (error: any) {
    console.error("\n❌ Erro ao criar usuário de teste:")
    console.error("Erro:", error.message)
    return false
  }
}

// Executar a criação
console.log("=== CRIAÇÃO DE USUÁRIO DE TESTE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

createTestUser()
  .then((success) => {
    console.log("\n=== RESUMO ===")
    if (success) {
      console.log("✅ Processo concluído!")
      console.log("\nPróximos passos:")
      console.log("1. Use o ID do usuário criado nos scripts de teste")
      console.log("2. Execute o script xgate-complete-flow.ts com o ID correto")
    } else {
      console.log("❌ Falha ao criar usuário de teste. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar a criação:", err)
    console.error("===============================")
  })

