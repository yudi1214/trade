const { Sequelize } = require('sequelize');

// URL do banco de dados (usando SQLite para simplicidade)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log
});

// Definir modelos
const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  accountType: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'demo'
  },
  realBalance: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  demoBalance: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 10000
  },
  bonusBalance: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  verified: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  kycApproved: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

const ResetCode = sequelize.define('ResetCode', {
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  code: {
    type: Sequelize.STRING,
    allowNull: false
  },
  expiresAt: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

async function syncModels() {
  try {
    // Sincronizar modelos com o banco de dados
    await sequelize.sync({ force: true });
    console.log('Modelos sincronizados com sucesso!');
    
    // Fechar conexão
    await sequelize.close();
  } catch (error) {
    console.error('Erro ao sincronizar modelos:', error);
  }
}

syncModels();