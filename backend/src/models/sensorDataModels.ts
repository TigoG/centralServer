import pool  from "../config/db";

import pg from 'pg';
import { Pool } from 'pg';

export const getStationsDB = async () => {
    const client = await pool.connect();
    const res  = await client.query('SELECT * FROM stations');
    // log(res);
    return res.rows;

}
