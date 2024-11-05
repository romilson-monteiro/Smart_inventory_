import { INTEGER, STRING, BOOLEAN, DATE } from "sequelize";
import { projeto2_db } from "../config/context/database.js";
import { UsersModel } from "./users.model.js";
/**
 * Log Data
 * id: INTEGER,
 *  user_id: INTEGER,
  *  description: STRING
  * timeStamps: DATE
  */

const LogsModel = projeto2_db.define('Log', {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  event_type: {
    type: STRING,
    allowNull: false,
  },
  description: {
    type: STRING,
    allowNull: false,
  },

  timeStamps: {
    type: DATE,
    allowNull: false,
  }
});




export { LogsModel };

const  NotificationModel = projeto2_db.define('Notification', {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  isViewed: {
    type: BOOLEAN,
    allowNull: false,
  },
  description: {
    type: STRING,
    allowNull: false,
  },
  timeStamps: {
    type: DATE,
    allowNull: false,
  }
});



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





export { NotificationModel };

