
import { getStationRow } from "../models/testModel";

import pg from 'pg';
import { Pool } from 'pg';
export const ping = async (req, res) => {
  try {
    res.status(200).send("Listining");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const stationRow = async (req, res) => {
  try {
    const stationRow = await getStationRow();
    res.status(201).json(stationRow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
