// Warning: Boiler plate

import express from "express";
import { getUsers, addUser } from "../controllers/templateUserController";
import { ping, stationRow } from "../controllers/testController";
import { getLatestDataRows, getStations } from "../controllers/sensorDataController";

const router = express.Router();

// test routes
router.get("/ping", ping);
router.get("/getStationRow", stationRow);

// paths
// router.get("/", getUsers);
// router.post("/", addUser);

router.get("/getLatestDataRows", getLatestDataRows);
router.get("/getStations", getStations);


export default router;

