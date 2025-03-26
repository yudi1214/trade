import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './db';

// Interface para o modelo User
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  accountType: string;
  realBalance: number;
  demoBalance: number;
  bonusBalance: number;
  document?: string;
  verified: boolean;
  kycApproved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Modelo User
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public accountType!: string;
  public realBalance!: number;
  public demoBalance!: number;
  public bonusBalance!: number;
  public document!: string;
  public verified!: boolean;
  public kycApproved!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'demo',
    },
    realBalance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    demoBalance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 10000,
    },
    bonusBalance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    kycApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

// Interface para o modelo ResetCode
interface ResetCodeAttributes {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ResetCodeCreationAttributes extends Optional<ResetCodeAttributes, 'id'> {}

// Modelo ResetCode
export class ResetCode extends Model<ResetCodeAttributes, ResetCodeCreationAttributes> implements ResetCodeAttributes {
  public id!: string;
  public email!: string;
  public code!: string;
  public expiresAt!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ResetCode.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'reset_codes',
  }
);

// Função para sincronizar os modelos com o banco de dados
export async function syncModels() {
  try {
    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');
  } catch (error) {
    console.error('Erro ao sincronizar modelos:', error);
  }
}

// Exportar os modelos;