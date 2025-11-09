
import { getStationRow } from "../models/testModel";
import { getLatestStationData, getStationIdDB, getStationsDB, getStationsIdsDB, getThreeHoursStationDataDB, updateStationDB } from "../models/sensorDataModels";



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
      // console.log(row);
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

export const updateStation = async (req, res) => {
  const llnummer = req.query?.llnummer ?? req.params?.llnummer;
  if (!llnummer) {
    return res.status(400).json({ message: "leerlingnummer is required as a query param (e.g. ?llnummer=1234567) or as a path param" });
  }

  const latitude = req.query?.latitude ?? req.params?.latitude;
  if (!latitude) {
    return res.status(400).json({ message: "latitude is required as a query param (e.g. ?latitude=51.504) or as a path param" });
  }

  const longitude = req.query?.longitude ?? req.params?.longitude;
  if (!longitude) {
    return res.status(400).json({ message: "longitude is required as a query param (e.g. ?longitude=3.888) or as a path param" });
  }

  try {
    const stationId = await getStationIdDB(llnummer);
    if (stationId === null) {
      return res.status(404).json({ message: "Station not found" });
    }

    const success = await updateStationDB(stationId, longitude, latitude);
    if (!success) {
      return res.status(500).json({ message: "Failed to update station" });
    }
    res.status(200).json({ message: "Station updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getThreeHoursStationData = async (req, res) => {
  try {
    // Accept stationId from query (?stationId=78) or from route params
    const llnummer = req.query?.llnummer ?? req.params?.llnummer;
    if (!llnummer) {
      return res.status(400).json({ message: "llnummer is required as a query param (e.g. ?llnummer=1234567) or as a path param" });
    }

    const stationId = await getStationIdDB(llnummer);
    if (!stationId) {
      return res.status(404).json({ message: "Station not found" });
    }

    const data = await getThreeHoursStationDataDB(stationId);
    if (data === null) {
      return res.status(404).json({ message: "No data found for the specified station in the last 3 hours" });
    }

    console.log("succesfully retrieved 3 hours of data for station id:", stationId, "with", data.length, "rows");

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


