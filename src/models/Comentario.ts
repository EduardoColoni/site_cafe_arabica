import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Comentario = sequelize.define('Comentario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  tipoCafe: {
    type: DataTypes.STRING,
    allowNull: false
  },
  metodoPreparo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'Comentarios',
  timestamps: true
});

export default Comentario;