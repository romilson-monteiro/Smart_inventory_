import { projeto2_db } from "../config/context/database.js";
import { DataTypes } from "sequelize";

const NotificationsModel = projeto2_db.define('notifications', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isViewed: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  timeStamps: {
    type: DataTypes.DATE,
    allowNull: true
  }
},
  {
    timestamps: true,  // Permite que Sequelize crie `createdAt` e `updatedAt`
    createdAt: 'createdAt',  // Nomeia explicitamente o campo `createdAt`
    updatedAt: 'updatedAt'   // Nomeia explicitamente o campo `updatedAt`
  }
);
export { NotificationsModel };

