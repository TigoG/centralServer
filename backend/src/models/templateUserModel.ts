// Warning: Boiler plate

import { pool } from "../config/db";

// All SQL logic for users lives here

export const getAllUsers = async () => {
  const client = await pool.connect();
  const result = await client.query("SELECT * FROM users ORDER BY id ASC");
  client.return();
  return result.rows;
};

export const createUser = async (name, email) => {
  const client = await pool.connect();
  const result = client.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  client.return();
  return result.rows[0];
};

