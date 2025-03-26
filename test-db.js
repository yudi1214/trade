const { Sequelize } = require('sequelize');

// URL do banco de dados (usando SQLite para simplicidade)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log
});

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
    // Criar um modelo simples para teste
    const User = sequelize.define('User', {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }
    });
    
    // Sincronizar o modelo com o banco de dados
    console.log('Sincronizando modelo...');
    await sequelize.sync({ force: true });
    console.log('Modelo sincronizado com sucesso!');
    
    // Criar um usuário de teste
    console.log('Criando usuário de teste...');
    await User.create({
      name: 'Usuário Teste',
      email: 'teste@exemplo.com'
    });
    
    // Contar usuários
    const count = await User.count();
    console.log(`Número de usuários: ${count}`);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await sequelize.close();
    console.log('Conexão fechada.');
  }
}

testConnection();