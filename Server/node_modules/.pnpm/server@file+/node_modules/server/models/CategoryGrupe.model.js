import { INTEGER, STRING, BOOLEAN, DATE } from "sequelize";
import { projeto2_db } from "../config/context/database.js";

/**
 * Category Grupe Data
 * id: INTEGER (Primary Key)
 * name: STRING
 * 
 */

const CategoryGrupeModel = projeto2_db.define('Category Grupe', {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  }
});


export { CategoryGrupeModel };