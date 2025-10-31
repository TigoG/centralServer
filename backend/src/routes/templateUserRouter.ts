// Warning: Boiler plate

import express from "express";
import { getUsers, addUser } from "../controllers/templateUserController";

const router = express.Router();

router.get("/", getUsers);
router.post("/", addUser);

export default router;