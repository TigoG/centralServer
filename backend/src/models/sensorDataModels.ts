import pool from "../config/db";

import pg from "pg";
import { Pool } from "pg";

export const updateStationDB = async (stationId, longitude, latitude) => {
  const client = await pool.connect();
  const res = await client.query(
    "UPDATE stations SET longitude = $1, latitude = $2 WHERE id = $3",
    [longitude, latitude, stationId],
  );
  client.release();

  // For pg query results, use rowCount to check affected rows
  if (res.rowCount && res.rowCount > 0) {
    return true;
  } else {
    return false;
  }
};

export const getStationsDB = async () => {
  const client = await pool.connect();
  const res = await client.query("SELECT * FROM stations");
  client.release();

  return res.rows;
};

export const getStationIdDB = async (stationId) => {
  const client = await pool.connect();
  const res = await client.query("SELECT * FROM stations where student_number = $1", [stationId]);
  client.release();
  if (res.rowCount === 0) {
    return null;
  }
  return res.rows[0].id;
};

export const getStationsIdsDB = async () => {
  const client = await pool.connect();
  const res = await client.query("SELECT id FROM stations");
  client.release();
  return res.rows;
};

export const getLatestStationData = async (stationId) => {
  const client = await pool.connect();
  const res = await client.query(
    "SELECT * FROM sensor_data WHERE station_id = $1 ORDER BY created_at DESC LIMIT 1",
    [stationId],
  );
  client.release();

  if (res.rowCount === 0) {
    return null;
  }
  // console.log(res);
  return res.rows[0];
};

export const getThreeHoursStationDataDB = async (stationId) => {
  const client = await pool.connect();
  const res = await client.query(
    `SELECT * FROM sensor_data 
     WHERE station_id = $1 AND created_at >= NOW() - INTERVAL '3 hours'`, [stationId],
  );
  client.release();

  if (res.rowCount === 0) {
    console.log("No data found for the in the last 3 hours for the station id:", stationId);
    return null;
  }
  return res.rows;
};