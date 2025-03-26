import { Sequelize } from "sequelize"

// Obtenha a URL do banco de dados do ambiente ou use uma conexão local
const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/trading_platform"

// Crie uma instância do Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "mysql", // Alterado para MySQL
  dialectModule: require("mysql2"), // Importante para evitar problemas com módulos nativos
  logging: console.log, // Defina como false para desativar logs SQL
})

// Função para testar a conexão
export async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log("Conexão com o banco de dados estabelecida com sucesso.")
    return true
  } catch (error) {
    console.error("Não foi possível conectar ao banco de dados:", error)
    return false
  }
}

export default sequelize

