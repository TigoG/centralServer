// Warning: Boiler plate

import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});