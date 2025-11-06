
import { getStationRow } from "../models/testModel";
import { getLatestStationData, getStationsDB, getStationsIdsDB } from "../models/sensorDataModels";



export const getLatestDataRows = async (req, res) => {
  try {
    const stationIds = await getStationsIdsDB();
    console.log(stationIds);

    const stationrows: any[] = [];
    for (let i = 0; i < stationIds.length; i++) {
      const stationId = stationIds[i].id;
      const row = await getLatestStationData(stationId);
      if (row === null) {
        continue;
      }
      console.log(row);
      stationrows.push(row);
    }

    res.status(201).json(stationrows);
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
