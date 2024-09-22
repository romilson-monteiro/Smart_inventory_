import { DataTypes } from 'sequelize';
import { projeto2_db } from '../config/context/database.js';
import { ObjectsModel } from './objects.model.js';
import { LocationModel } from './location.model.js';


/* Moviments MovimentsModel 
  * id: INTEGER (Primary Key)
  * last_location: INTEGER
  * current_location: INTEGER
  * description: STRING
  * type: STRING
  * asset_id: INTEGER
  * timeStamps: DATE
  * 
  * 
    */


export const MovimentsModel = projeto2_db.define('Moviments', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  last_location: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  current_location: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  timeStamps: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

MovimentsModel.belongsTo(ObjectsModel, { as: 'asset', foreignKey: 'asset_id', onDelete: 'NO ACTION' });
MovimentsModel.belongsTo(LocationModel, { as: 'lastLocation', foreignKey: 'last_location', onDelete: 'NO ACTION' });
MovimentsModel.belongsTo(LocationModel, { as: 'currentLocation', foreignKey: 'current_location', onDelete: 'NO ACTION' });
