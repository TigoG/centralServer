import "./History.css";
import React, { useEffect, useState } from "react";
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

function History() {
  // Sample dataset for multiple student IDs so the dropdown has meaningful options.
  // In the real app you can replace dataByStudent with data fetched from the backend or MQTT messages.
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

  const dataByStudent = {
    "1060011": makeDataForStudent(0),
    "1060012": makeDataForStudent(2),
    "1060013": makeDataForStudent(4),
  };

  const [studentIds] = useState(Object.keys(dataByStudent));
  const [selectedStudent, setSelectedStudent] = useState(studentIds[0] || "");
  const [selectedSensor, setSelectedSensor] = useState(DEFAULT_SENSOR || "temperature");

  useEffect(() => {
    // Ensure the selected sensor exists in SENSOR_TYPES; fallback if needed.
    if (!SENSOR_TYPES.includes(selectedSensor)) {
      setSelectedSensor(DEFAULT_SENSOR || "temperature");
    }
  }, []); // run once on mount

  const chartData = dataByStudent[selectedStudent] || [];

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
            {studentIds.map((id) => (
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
          >
            {SENSOR_TYPES.map((s) => (
              <option key={s} value={s}>
                {sensorLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

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
    </div>
  );
}

export default History;
