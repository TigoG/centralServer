// Warning: Boiler plate

import { pool } from "../config/db";

// All SQL logic for users lives here

export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  return result.rows;
};

export const createUser = async (name, email) => {
  const result = await pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  return result.rows[0];
};