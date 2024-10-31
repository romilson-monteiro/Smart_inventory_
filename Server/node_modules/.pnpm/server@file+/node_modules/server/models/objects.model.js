import { INTEGER, STRING, BOOLEAN, DATE } from "sequelize";
import { DataTypes } from "sequelize";
import { projeto2_db } from "../config/context/database.js";
import { LocationModel } from "./location.model.js"
import {CategoryModel} from "./Category.model.js"

/**
 * Objects Data
 * id: INTEGER (Primary Key)
 * name: STRING
 * location_id: INTEGER
 *  uhf_tag: STRING
 * category_id: INTEGER
 * description: STRING
 * location_last_update: DATE
 */



const ObjectsModel = projeto2_db.define('objects', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  uhf_tag: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location_last_update: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'objects'
});

// Definindo associações, nao apagar se o pai foi deletado
ObjectsModel.belongsTo(LocationModel, { as: 'location', foreignKey: 'location_id', onDelete: 'NO ACTION' });
ObjectsModel.belongsTo(CategoryModel, { as: 'category', foreignKey: 'category_id' , onDelete: 'NO ACTION' });
export { ObjectsModel };
