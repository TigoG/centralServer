import "./History.css";
import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SENSOR_TYPES, DEFAULT_SENSOR } from "../../config/constants";
import { useStations } from "../../contexts/StationsContext.jsx";

function History() {
  // Sample time buckets for the chart (mock data)
  const times = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const makeDataForStudent = (offset = 0) =>
    times.map((t, i) => ({
      time: t,
      temperature: 18 + ((i + offset) % 6), // °C
      humidity: 60 - ((i + offset) % 10), // %
      windspeed: Math.round(((i + offset) % 8) * 1.3 * 10) / 10, // km/h
      light: 200 + ((i + offset) % 6) * 50, // lx
      uv: ((i + offset) % 11) / 2,
      airpresure: 1010 + ((i + offset) % 5),
      altitude: 50 + ((i + offset) % 10),
      soilmoisture: 30 + ((i + offset) % 50),
      rain: ((i + offset) % 3) === 0 ? ((i + offset) % 10) : 0,
      flowrate: ((i + offset) % 7) * 0.2,
      winddirection: ((i + offset) % 12) * 30,
      gasresistance: 100 + ((i + offset) % 200),
    }));

  const { stations } = useStations();
  const availableStudentIds =
    stations && stations.length > 0 ? stations.map((s) => s.id) : ["1060011", "1060012", "1060013"];

  const [selectedStudent, setSelectedStudent] = useState(availableStudentIds[0] || "");
  useEffect(() => {
    // If availableStudentIds changes (e.g. after context load), ensure selectedStudent is valid.
    if (availableStudentIds.length > 0 && !availableStudentIds.includes(selectedStudent)) {
      setSelectedStudent(availableStudentIds[0]);
    }
  }, [availableStudentIds, selectedStudent]);

  const [selectedSensor, setSelectedSensor] = useState(DEFAULT_SENSOR || "temperature");

  // compute available sensors for the currently selected student (only sensors with valid values)
  const selectedStation = stations && stations.find((s) => s.id === selectedStudent);
  const availableSensors = useMemo(() => {
    if (!selectedStation || !selectedStation.sensors) return [];
    const keys = Object.keys(selectedStation.sensors).filter((k) => {
      const v = selectedStation.sensors[k];
      return v !== -1 && v !== null && v !== undefined;
    });
    // preserve SENSOR_TYPES order
    return SENSOR_TYPES.filter((s) => keys.includes(s));
  }, [selectedStation]);

  const hasSensors = availableSensors && availableSensors.length > 0;
  const sensorOptions = hasSensors ? availableSensors : [];

  // Ensure selectedSensor stays valid when selectedStation or availableSensors change
  useEffect(() => {
    if (hasSensors) {
      if (!availableSensors.includes(selectedSensor)) {
        setSelectedSensor(availableSensors[0]);
      }
    } else {
      setSelectedSensor("");
    }
  }, [selectedStudent, availableSensors, hasSensors]);

  // Choose mock chart data based on the index of the selected student so each student shows a different series.
  const offset = Math.max(0, availableStudentIds.indexOf(selectedStudent));
  const chartData = makeDataForStudent(offset);

  const sensorLabel = (sensor) => {
    switch (sensor) {
      case "temperature":
        return "Temperature (°C)";
      case "humidity":
        return "Humidity (%)";
      case "windspeed":
        return "Wind speed (km/h)";
      case "uv":
        return "UV index";
      case "light":
        return "Light (lx)";
      case "airpresure":
        return "Air pressure (hPa)";
      case "altitude":
        return "Altitude (m)";
      case "soilmoisture":
        return "Soil moisture (%)";
      case "rain":
        return "Rain (mm)";
      case "flowrate":
        return "Flow rate";
      case "winddirection":
        return "Wind direction (°)";
      case "gasresistance":
        return "Gas resistance (Ω)";
      default:
        return sensor;
    }
  };

  const strokeFor = (sensor) => {
    switch (sensor) {
      case "temperature":
        return "#00377E";
      case "humidity":
        return "#377E00";
      case "windspeed":
        return "#FF8C00";
      case "light":
        return "#FFD700";
      default:
        return "#8884d8";
    }
  };

  const sensorOptionsList = sensorOptions && sensorOptions.length > 0 ? sensorOptions : [];

  return (
    <div className="history">
      <div className="title">
        <h2>History</h2>
      </div>

      <div
        className="controls"
        style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}
      >
        <label>
          Student:
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            {availableStudentIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sensor:
          <select
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
            style={{ marginLeft: 8 }}
            disabled={!hasSensors}
          >
            {hasSensors ? (
              sensorOptionsList.map((s) => (
                <option key={s} value={s}>
                  {sensorLabel(s)}
                </option>
              ))
            ) : (
              <option value="">No sensors available</option>
            )}
          </select>
        </label>
      </div>

      {hasSensors ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ccccccff" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedSensor}
              stroke={strokeFor(selectedSensor)}
              name={sensorLabel(selectedSensor)}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div
          className="no-sensors-placeholder"
          style={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            border: "1px dashed #cbd5e1",
            borderRadius: 6,
            background: "#f8fafc",
          }}
        >
          No sensors available for the selected station
        </div>
      )}
    </div>
  );
}

export default History;
