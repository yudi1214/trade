import { testConnection } from "./db"
import { syncModels } from "./models"

export async function initDatabase() {
  try {
    // Teste a conexão
    const connected = await testConnection()

    if (!connected) {
      console.error("Não foi possível conectar ao banco de dados. Verifique suas configurações.")
      return false
    }

    // Sincronize os modelos
    await syncModels()

    return true
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error)
    return false
  }
}

// Inicialize o banco de dados quando o servidor iniciar
initDatabase()

