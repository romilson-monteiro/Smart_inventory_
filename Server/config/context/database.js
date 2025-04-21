import { Sequelize } from "sequelize";


const projeto2_db = new Sequelize({
  host: "localhost",
  port: 3306,
  username: "admin",
  password: "admin123",
  database: "TexPACT",
  dialect: "mysql", 
});

export { projeto2_db };

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
 * Location Data 
 * id: INTEGER (Primary Key)
 * name: STRING
 * floor: INTEGER
 * description: STRING
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
