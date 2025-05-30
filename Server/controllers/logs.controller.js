/* import { INTEGER, STRING, BOOLEAN, DATE } from "sequelize";
import { projeto2_db } from "../config/context/database.js";
import { UsersModel } from "./users.model.js";
import { ObjectsModel } from "../models/objects.model.js";
import { CategoryModel } from "../models/Category.model.js";
import { LocationModel } from "../models/location.model.js";
import { CategoryGrupeModel } from "../models/CategoryGrupe.model.js";
import { MovimentsModel } from "../models/moviments.model.js";
 * Log Data
 * id: INTEGER,
 *  user_id: INTEGER,
  *  description: STRING
  * timeStamps: DATE
  

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
  user_id: {
    type: INTEGER,
    allowNull: true,
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



// Establish foreign key relationships
LogsModel.belongsTo(UsersModel, { foreignKey: 'user_id' });

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

export { NotificationModel };

 */


import {LogsModel,NotificationModel} from '../models/Logs.model.js';
import {UsersModel} from '../models/users.model.js';

export const createLog = async (req, res) => {
    try {
        const {event_type, description} = req.body;
        const timeStamps = new Date();
        const log = await LogsModel.create({event_type, description, timeStamps});
        return res.json({
            id: log.id,
            event_type: log.event_type,
            description: log.description,
            timeStamps: log.timeStamps,
        });
    } catch (error) {
        console.error('Error adding log:', error);
        return res.status(500).json({message: 'Failed to add log', error});
    }
}

export const getAllLogs = async (req, res) => {
    try {
      // retornar organizado por mais recente
        const logs = await LogsModel.findAll({order: [['timeStamps', 'DESC']]});


        return res.json(logs);
    } catch (error) {
        console.error('Error retrieving logs:', error);
        return res.status(500).json({message: 'Failed to retrieve logs'});
    }
} 

export const getLogById = async (req, res) => {
    try {
        const {id} = req.params;
        const log = await LogsModel.findByPk(id);
        if (!log) {
            return res.status(404).json({message: 'Log not found'});
        }
        return res.json(log);
    } catch (error) {
        console.error('Error retrieving log:', error);
        return res.status(500).json({message: 'Failed to retrieve log'});
    }
} 








export const createNotification = async (req, res) => {
    try {
        const {isViewed, description} = req.body;
        const timeStamps = new Date();
        const notification = await NotificationModel.create({isViewed, description, timeStamps});
        return res.json({
            id: notification.id,
            isViewed: notification.isViewed,
            description: notification.description,
            timeStamps: notification.timeStamps,
        });
    } catch (error) {
        console.error('Error adding notification:', error);
        return res.status(500).json({message: 'Failed to add notification', error});
    }
}

export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await NotificationModel.findAll({order: [['timeStamps', 'DESC']]});
        return res.json(notifications);
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        return res.status(500).json({message: 'Failed to retrieve notifications'});
    }
}

export const getNotificationById = async (req, res) => {
    try {
        const {id} = req.params;
        const notification = await NotificationModel.findByPk(id);
        if (!notification) {
            return res.status(404).json({message: 'Notification not found'});
        }
        return res.json(notification);
    } catch (error) {
        console.error('Error retrieving notification:', error);
        return res.status(500).json({message: 'Failed to retrieve notification'});
    }
}


export const updateNotificationViewed = async (req, res) => {
    try {
        const {id} = req.params;
        const notification = await NotificationModel.findByPk(id);
        if (!notification) {
            return res.status(404).json({message: 'Notification not found'});
        }
        notification.isViewed = true;
        await notification.save();
        return res.json(notification);
    } catch (error) {
        console.error('Error updating notification:', error);
        return res.status(500).json({message: 'Failed to update notification'});
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const {id} = req.params;
        const notification = await NotificationModel.findByPk(id);
        if (!notification) {
            return res.status(404).json({message: 'Notification not found'});
        }
        await notification.destroy();
        return res.json({message: 'Notification deleted'});
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({message: 'Failed to delete notification'});
    }
}


// Função para contar todas as notificações não visualizadas
export const countUnreadNotifications = async (req, res) => {
    try {
        const unreadCount = await NotificationModel.count({
            where: { isViewed: false }
        });
        return res.json({ unreadCount });
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        return res.status(500).json({ message: 'Failed to count unread notifications' });
    }
};
