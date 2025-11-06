
import { getStationRow } from "../models/testModel";
import { getStationsDB } from "../models/sensorDataModels.ts";



export const getLatestDataRows = async (req, res) => {
  try {
    const stationRow = await getStationRow();
    res.status(201).json(stationRow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStations = async (req, res) => {
  try {
    const stationRow = await getStationsDB();
    res.status(201).json(stationRow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
