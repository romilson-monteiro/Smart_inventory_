import { Router } from "express";
import { usersRoutes} from "./users.routes.js";
import { objectsRoutes } from "./objects.routes.js";
import { LocationRoutes } from "./location.routes.js";
import { alertsRoutes } from "./logs.routes.js";
import { authRequired } from "../utils/jwt.js";
import { statisticsRoutes } from "./statistics.routes.js";


const api = Router();

// Routes for user functions
//http://localhost/api/user
api.use("/user", usersRoutes);
api.use("/objects", objectsRoutes);
api.use("/Locations", LocationRoutes);

api.use("/alerts", alertsRoutes);
api.post("/validateToken", authRequired, (req, res) => {
    res.json({ user: req.user.name });
    }
);

api.use("/statistics", statisticsRoutes);




export { api };