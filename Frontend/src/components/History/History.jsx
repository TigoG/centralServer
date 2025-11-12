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
import { SENSOR_TYPES, DEFAULT_SENSOR, NL_CENTER } from "../../config/constants";
import { GetStations, GetAllStations } from "../BackendConnection/BackendConnection.jsx";

function History() {
  // Sample dataset fallback for when the backend is unavailable or returns no ids.
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
      airpressure: 1010 + ((i + offset) % 5),
      altitude: 50 + ((i + offset) % 10),
      soilmoisture: 30 + ((i + offset) % 50),
      rain: ((i + offset) % 3) === 0 ? ((i + offset) % 10) : 0,
      flowrate: ((i + offset) % 7) * 0.2,
      winddirection: ((i + offset) % 12) * 30,
      gasresistance: 100 + ((i + offset) % 200),
    }));

  const sampleDataByStudent = {
    "1060011": makeDataForStudent(0),
    "1060012": makeDataForStudent(2),
    "1060013": makeDataForStudent(4),
  };

  const [studentIds, setStudentIds] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSensor, setSelectedSensor] = useState(DEFAULT_SENSOR || "temperature");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Ensure the selected sensor exists in SENSOR_TYPES; fallback if needed.
    if (!SENSOR_TYPES.includes(selectedSensor)) {
      setSelectedSensor(DEFAULT_SENSOR || "temperature");
    }
  }, []); // run once on mount

  useEffect(() => {
    let mounted = true;

    function normalizeArray(arr) {
      return (arr || []).map((s) => {
        const id = String(
          s.id ??
            s.station_id ??
            s.llnummer ??
            s.student_number ??
            s.name ??
            Math.random()
        );
        const student_number = String(
          s.student_number ?? s.llnummer ?? s.name ?? s.id ?? `Station ${id}`
        );
        const lat = Number(
          s.lat ?? s.latitude ?? s.latitude_deg ?? s.latitudeDegrees ?? null
        );
        const lon = Number(
          s.lon ?? s.longitude ?? s.longitude_deg ?? s.longitudeDegrees ?? null
        );
        const location = Number(s.location ?? s.location_id ?? 1);
        return {
          id,
          student_number,
          name: student_number,
          lat: Number.isFinite(lat) ? lat : NL_CENTER[0],
          lon: Number.isFinite(lon) ? lon : NL_CENTER[1],
          location,
          sensors: s.sensors ?? s.latest_sensors ?? {},
        };
      });
    }

    async function fetchStudentIds() {
      try {
        // prefer GetStations used by Layout
        let data = await GetStations();
        console.log("History: GetStations returned:", data);
        let arr = Array.isArray(data)
          ? data
          : data && typeof data === "object"
          ? Object.values(data)
          : [];
        let normalized = normalizeArray(arr);

        // prefer the same station list as on the Layout (don't filter by sensors)
        let ids = normalized.map((s) => s.student_number).filter(Boolean);
        let uniqueIds = Array.from(new Set(ids));

        if (uniqueIds.length === 0) {
          // fallback to GetAllStations on 145.24.237.211:8000
          try {
            const stations = await GetAllStations({ baseUrl: "http://145.24.237.211:8000/" });
            const arr2 = Array.isArray(stations) ? stations : stations && typeof stations === "object" ? Object.values(stations) : [];
            const normalized2 = normalizeArray(arr2);
            const ids2 = normalized2.map((s) => s.student_number).filter(Boolean);
            uniqueIds = Array.from(new Set(ids2));
          } catch (e) {
            console.error("History: GetAllStations failed:", e);
          }
        }

        if (uniqueIds.length > 0) {
          if (mounted) {
            setStudentIds(uniqueIds);
            setSelectedStudent((prev) => prev || uniqueIds[0]);
          }
        } else {
          const sampleIds = Object.keys(sampleDataByStudent);
          if (mounted) {
            setStudentIds(sampleIds);
            setSelectedStudent(sampleIds[0] || "");
          }
        }
      } catch (err) {
        console.error("History: Failed to fetch stations via GetStations:", err);
        const sampleIds = Object.keys(sampleDataByStudent);
        if (mounted) {
          setStudentIds(sampleIds);
          setSelectedStudent(sampleIds[0] || "");
        }
      }
    }

    fetchStudentIds();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // When selectedStudent changes, fetch the last 3 hours station data from the backend.
    if (!selectedStudent) {
      setChartData([]);
      return;
    }
    let mounted = true;

    async function fetchThreeHours() {
      try {
        const url = `http://145.24.237.211:8000/getThreeHoursStationData?llnummer=${encodeURIComponent(
          selectedStudent
        )}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to fetch 3-hours data:", res.status, res.statusText);
          // fallback to sample
          const fallback = sampleDataByStudent[selectedStudent] || [];
          if (mounted) setChartData(fallback);
          return;
        }
        const data = await res.json();
        // Normalize response into an array and attach epoch + readable label + sensor properties
        const rawArr = Array.isArray(data)
          ? data
          : data && typeof data === "object"
          ? Object.values(data)
          : [];

        function parseEpoch(item) {
          if (!item) return null;
          const candidates = [
            "timestamp",
            "ts",
            "timeEpoch",
            "epoch",
            "time",
            "created_at",
            "createdAt",
            "date",
            "datetime",
          ];
          for (const c of candidates) {
            if (Object.prototype.hasOwnProperty.call(item, c)) {
              const v = item[c];
              if (typeof v === "number") {
                // seconds -> ms
                if (v < 1e10) return Math.floor(v * 1000);
                return v;
              }
              if (typeof v === "string") {
                const num = Number(v);
                if (!Number.isNaN(num)) {
                  if (num < 1e10) return Math.floor(num * 1000);
                  return num;
                }
                const parsed = Date.parse(v);
                if (!Number.isNaN(parsed)) return parsed;
              }
            }
          }
          // try to infer from numeric time-like keys
          for (const k of Object.keys(item || {})) {
            const val = item[k];
            if (
              typeof val === "number" &&
              (k.toLowerCase().includes("time") ||
                k.toLowerCase().includes("ts") ||
                k.toLowerCase().includes("date"))
            ) {
              if (val < 1e10) return Math.floor(val * 1000);
              return val;
            }
          }
          return null;
        }

        function formatTimeLabel(epoch) {
          try {
            const d = new Date(Number(epoch));
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          } catch (e) {
            return String(epoch);
          }
        }

        function extractValue(obj, key) {
          if (!obj) return undefined;
          if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
          const lower = String(key).toLowerCase();
          // check nested sensors object first
          if (obj.sensors && typeof obj.sensors === "object") {
            for (const k of Object.keys(obj.sensors)) {
              if (k.toLowerCase() === lower) return obj.sensors[k];
            }
          }
          for (const k of Object.keys(obj)) {
            if (k.toLowerCase() === lower) return obj[k];
          }
          for (const k of Object.keys(obj)) {
            if (k.toLowerCase().includes(lower)) return obj[k];
          }
          return undefined;
        }

        const normalized = (rawArr || [])
          .map((item) => {
            const obj = typeof item === "object" && item !== null ? { ...item } : { value: item };
            const epoch = parseEpoch(obj) || Date.now();
            obj.timeEpoch = epoch;
            obj.timeLabel = formatTimeLabel(epoch);

            // populate known sensor keys (case-insensitive) so the chart's dataKey works reliably
            (SENSOR_TYPES || []).forEach((s) => {
              const v = extractValue(obj, s);
              if (typeof v !== "undefined") {
                const n = Number(v);
                obj[s] = Number.isNaN(n) ? v : n;
              }
            });

            return obj;
          })
          .sort((a, b) => a.timeEpoch - b.timeEpoch);

        if (mounted) setChartData(normalized);
      } catch (err) {
        console.error("Error fetching 3-hours data:", err);
        const fallback = sampleDataByStudent[selectedStudent] || [];
        if (mounted) setChartData(fallback);
      }
    }

    fetchThreeHours();
    return () => {
      mounted = false;
    };
  }, [selectedStudent]);

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
      case "airpressure":
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

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ccccccff" />
            <XAxis dataKey="timeLabel" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value, name) => [value, sensorLabel(name)]}
            />
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

      <div style={{ height: 12 }} />
    </div>
  );
}

export default History;
