import { getDashboardStatistics, reportStatistics } from  "../controllers/statistics.controller.js";
import { Router } from "express";
const statisticsRoutes = Router();

//http://localhost/api/statistics/dashboard
statisticsRoutes.get("/dashboard", getDashboardStatistics);

//http://localhost/api/statistics/report
statisticsRoutes.get("/report", reportStatistics);

export { statisticsRoutes };