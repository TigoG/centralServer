import express from "express";
import dotenv from 'dotenv';
import pool from './config/db';
import router from "./routes/templateUserRouter";
const app = express();
const PORT = 8445;

dotenv.config();


app.use(express.json())
 
app.listen (
    PORT,
    () => console.log(`It's alive on http://localhost:${PORT}`)
)

app.use('', router);

