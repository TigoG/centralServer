import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import pool from './config/db';
import router from "./routes/templateUserRouter";
import initializeMQTT from "./services/mqttService";

const app = express();
const PORT = 8445;


initializeMQTT()

dotenv.config();

const allowedOrigins = [
  'http://localhost:5173',
  'http://145.24.237.211:8002',
  'http://145.24.237.211'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json())
 
app.listen (
    PORT,
    () => console.log(`It's alive on http://localhost:${PORT}`)
)

app.use('', router);

