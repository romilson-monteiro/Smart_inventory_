import { INTEGER, STRING, BOOLEAN, DATE } from "sequelize";
import { projeto2_db } from "../config/context/database.js";
import { LocationModel } from "./location.model.js"
import { DataTypes } from "sequelize";

/**
 * user Data
 * id: INTEGER (Primary Key)
 * name: STRING
 * email: STRING
 * phone: STRING
 * username: STRING
 * aruco_id: INTEGER
 * location_id: INTEGER
 * location_last_update: DATE
 * password: STRING
 * role: STRING
 * 
 */





const UsersModel = projeto2_db.define('Users', {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
    allowNull: true,
  },
  email: {
    type: STRING,

    unique:true,
    },
  phone: {
      type: STRING,
      allowNull: true,
  },
 
  username: {
    type: STRING,
    
    unique:true,
  },
  aruco_id: {
    type: INTEGER,
    allowNull: true,
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  location_last_update: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  password: {
    type: STRING,
    allowNull: false,
  },
  role: {
    type: STRING,
    allowNull: false,
  }
});

// Definindo associações
UsersModel.belongsTo(LocationModel, { as: 'location', foreignKey: 'location_id' });


export { UsersModel };