import { INTEGER, STRING } from "sequelize";
import { projeto2_db } from "../config/context/database.js";


/**
 * Location Data 
 * id: INTEGER (Primary Key)
 * name: STRING
 * floor: INTEGER
 * description: STRING
 *  
 */

// models/location.model.js

import { Sequelize, DataTypes } from 'sequelize';


const LocationModel = projeto2_db.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'locations',
});

export { LocationModel };
