import pool  from "../config/db";

import pg from 'pg';
import { Pool } from 'pg';
export const getStationRow = async () => {
    const client = await pool.connect();
    const res  = await client.query('SELECT * FROM stations');
    return res.rows[0];
}

