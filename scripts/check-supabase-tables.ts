import { supabase } from "../lib/supabase"

/**
 * Script para verificar a estrutura das tabelas no Supabase
 */
async function checkSupabaseTables() {
  try {
    console.log("Verificando conexão com o Supabase...")
    const { data: testData, error: testError } = await supabase.from("transactions").select("*").limit(1)

    if (testError) {
      console.error("❌ Erro ao conectar com o Supabase:", testError.message)
      console.error("Verifique se as variáveis de ambiente estão configuradas corretamente.")
      return false
    }

    console.log("✅ Conexão com o Supabase estabelecida!")

    // Verificar tabela transactions
    console.log("\n=== VERIFICANDO TABELA TRANSACTIONS ===")
    try {
      const { data, error } = await supabase.rpc("get_table_definition", { table_name: "transactions" })

      if (error) {
        console.error("❌ Erro ao obter definição da tabela transactions:", error.message)

        // Tentar obter apenas os dados para inferir a estrutura
        console.log("Tentando obter dados da tabela transactions...")
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .limit(1)

        if (transactionsError) {
          console.error("❌ Erro ao obter dados da tabela transactions:", transactionsError.message)
        } else if (transactionsData && transactionsData.length > 0) {
          console.log("✅ Estrutura inferida da tabela transactions:")
          console.log("Colunas:", Object.keys(transactionsData[0]))
        } else {
          console.log("⚠️ Tabela transactions existe mas está vazia")
        }
      } else {
        console.log("✅ Definição da tabela transactions:")
        console.log(data)
      }
    } catch (e) {
      console.error("❌ Erro ao verificar tabela transactions:", e)

      // Tentar listar todas as tabelas
      console.log("\nListando todas as tabelas disponíveis...")
      const { data: tablesData, error: tablesError } = await supabase
        .from("pg_tables")
        .select("tablename")
        .eq("schemaname", "public")

      if (tablesError) {
        console.error("❌ Erro ao listar tabelas:", tablesError.message)
      } else {
        console.log(
          "✅ Tabelas disponíveis:",
          tablesData.map((t) => t.tablename),
        )
      }
    }

    // Verificar tabela xgate_customer_mapping
    console.log("\n=== VERIFICANDO TABELA XGATE_CUSTOMER_MAPPING ===")
    try {
      const { data, error } = await supabase.rpc("get_table_definition", { table_name: "xgate_customer_mapping" })

      if (error) {
        console.error("❌ Erro ao obter definição da tabela xgate_customer_mapping:", error.message)

        // Tentar obter apenas os dados para inferir a estrutura
        console.log("Tentando obter dados da tabela xgate_customer_mapping...")
        const { data: mappingData, error: mappingError } = await supabase
          .from("xgate_customer_mapping")
          .select("*")
          .limit(1)

        if (mappingError) {
          console.error("❌ Erro ao obter dados da tabela xgate_customer_mapping:", mappingError.message)
        } else if (mappingData && mappingData.length > 0) {
          console.log("✅ Estrutura inferida da tabela xgate_customer_mapping:")
          console.log("Colunas:", Object.keys(mappingData[0]))
        } else {
          console.log("⚠️ Tabela xgate_customer_mapping existe mas está vazia")
        }
      } else {
        console.log("✅ Definição da tabela xgate_customer_mapping:")
        console.log(data)
      }
    } catch (e) {
      console.error("❌ Erro ao verificar tabela xgate_customer_mapping:", e)
    }

    // Verificar tabela users
    console.log("\n=== VERIFICANDO TABELA USERS ===")
    try {
      const { data, error } = await supabase.rpc("get_table_definition", { table_name: "users" })

      if (error) {
        console.error("❌ Erro ao obter definição da tabela users:", error.message)

        // Tentar obter apenas os dados para inferir a estrutura
        console.log("Tentando obter dados da tabela users...")
        const { data: usersData, error: usersError } = await supabase.from("users").select("*").limit(1)

        if (usersError) {
          console.error("❌ Erro ao obter dados da tabela users:", usersError.message)
        } else if (usersData && usersData.length > 0) {
          console.log("✅ Estrutura inferida da tabela users:")
          console.log("Colunas:", Object.keys(usersData[0]))
          console.log("Primeiro usuário:", usersData[0])
        } else {
          console.log("⚠️ Tabela users existe mas está vazia")
        }
      } else {
        console.log("✅ Definição da tabela users:")
        console.log(data)
      }
    } catch (e) {
      console.error("❌ Erro ao verificar tabela users:", e)
    }

    return true
  } catch (error: any) {
    console.error("\n❌ Erro ao verificar tabelas do Supabase:")
    console.error("Erro:", error.message)
    return false
  }
}

// Executar a verificação
console.log("=== VERIFICAÇÃO DE TABELAS DO SUPABASE ===")
console.log("Data e hora:", new Date().toLocaleString())
console.log("===============================\n")

checkSupabaseTables()
  .then((success) => {
    console.log("\n=== RESUMO ===")
    if (success) {
      console.log("✅ Verificação de tabelas concluída!")
      console.log("\nPróximos passos:")
      console.log("1. Verifique a estrutura das tabelas nos logs acima")
      console.log("2. Ajuste o script xgate-complete-flow.ts para corresponder à estrutura real")
    } else {
      console.log("❌ Falha ao verificar tabelas do Supabase. Verifique os erros acima.")
    }
    console.log("===============================")
  })
  .catch((err) => {
    console.error("\n=== ERRO FATAL ===")
    console.error("Erro não tratado ao executar a verificação:", err)
    console.error("===============================")
  })

