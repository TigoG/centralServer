import pool  from "../config/db";

import pg from 'pg';
import { Pool } from 'pg';

export const getStationsDB = async () => {
    const client = await pool.connect();
    const res  = await client.query('SELECT * FROM stations');
    return res.rows;
}

export const getStationsIdsDB = async () => {
    const client = await pool.connect();
    const res  = await client.query('SELECT id FROM stations');
    return res.rows;
}

export const getLatestStationData = async (stationId) => {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM sensor_data WHERE station_id = $1 ORDER BY created_at DESC LIMIT 1', [stationId]);

    if (res.rowCount === 0) {
        return null;
    }
    // console.log(res);
    return res.rows[0];
}
