import { INTEGER, STRING, BOOLEAN, DATE } from "sequelize";
import { projeto2_db } from "../config/context/database.js";
import { CategoryGrupeModel } from "./CategoryGrupe.model.js";

const CategoryModel = projeto2_db.define('category', {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    name: {
    type: STRING,
    allowNull: false,

  },
  CategoryGrupe_id: {
    type: INTEGER,
    allowNull: false,
  }, 
  description: {
    type: STRING,
    allowNull: true,
  }
});

// Establish foreign key relationships
CategoryModel.belongsTo(CategoryGrupeModel, { foreignKey: 'CategoryGrupe_id' , as: 'categoryGroup' , onDelete: 'CASCADE' });



export { CategoryModel };


/**
 * Category Data
 * id: INTEGER (Primary Key)
 * name: STRING 
 * CategoryGrupe_id: INTEGER (Foreign Key)
 * description: STRING
 */


/**
 * Category Grupe Data
 * id: INTEGER (Primary Key)
 * name: STRING
 * 
 */
/**
 * Location Data 
 * id: INTEGER (Primary Key)
 * name: STRING
 * floor: INTEGER
 * description: STRING
 *  
 */
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

/**
 * Objects Data
 * id: INTEGER (Primary Key)
 * name: STRING
 * location_id: INTEGER
 *  serial: STRING
 * category_id: INTEGER
 * description: STRING
 * location_last_update: DATE
 */
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
/* Notification NotificationModel 
  * id: INTEGER (Primary Key)
  * isViewed: BOOLEAN
  * description: STRING
  * timeStamps: DATE
  * 
  * 
    */

/* Logs LogsModel 
  * id: INTEGER (Primary Key)
  * user_id: INTEGER (Foreign Key)
  * description: STRING
  * timeStamps: DATE
  * event_type: STRING
  * 
  * 
    */