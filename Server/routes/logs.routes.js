
import { Router } from "express";
import { createLog,
    getAllLogs,
    getLogById,
    createNotification,
    getAllNotifications,
    getNotificationById,
    updateNotificationViewed,
    deleteNotification,
    countUnreadNotifications
  } from "../controllers/logs.controller.js";

import { authRequired } from "../utils/jwt.js";
const alertsRoutes = Router();

//http://192.168.1.6:4242/api/alerts/Logs/create
alertsRoutes.post("/Logs/create", authRequired, createLog);
//http://192.168.1.6:4242/api/alerts/Logs/
alertsRoutes.get("/Logs/", authRequired, getAllLogs);
//http://192.168.1.6:4242/api/alerts/Logs/:id
alertsRoutes.get("/Logs/:id", authRequired, getLogById);

//http://192.168.1.6:4242/api/alerts/Notification/create
alertsRoutes.post("/Notification/create", authRequired, createNotification);
//http://192.168.1.6:4242/api/alerts/Notification/
alertsRoutes.get("/Notification/", authRequired, getAllNotifications);
//http://192.168.1.6:4242/api/alerts/Notification/:id
alertsRoutes.get("/Notification/:id", authRequired, getNotificationById);
//http://192.168.1.6:4242/api/alerts/Notification/count
alertsRoutes.get("/NotificationCount", authRequired, countUnreadNotifications);
//http://192.168.1.6:4242/api/alerts/NotificationViewed/:id
alertsRoutes.put("/NotificationViewed/:id", authRequired, updateNotificationViewed);
//http://192.168.1.6:4242/api/alerts/Notification/:id
alertsRoutes.delete("/Notification/:id", authRequired, deleteNotification);

export {alertsRoutes}


