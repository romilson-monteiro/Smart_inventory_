import { Router } from "express";

import { create,  deleteLocation,  updateLocation, getAllLocations, getLocationsbyId,getAllLocationByFloor } from "../controllers/location.controller.js";
import { authRequired } from "../utils/jwt.js";
const LocationRoutes = Router();


//http://localhost:4242/api/Locations/create
LocationRoutes.post("/create", authRequired,  create);
//http://localhost:4242/api/Locations/:id
LocationRoutes.delete("/:id", authRequired,  deleteLocation);
//http://localhost:4242/api/Locations/getallLocations
LocationRoutes.get("/", authRequired, getAllLocations);

LocationRoutes.get("/:id", authRequired, getLocationsbyId);
//http://localhost:4242/api/Locations/:id
LocationRoutes.put("/:id", authRequired,  updateLocation);



//http://localhost:4242/api/Locations/getallLocationsByFloor/:floor
LocationRoutes.get("/LocationByFloor/:floor", authRequired, getAllLocationByFloor);

export {LocationRoutes}