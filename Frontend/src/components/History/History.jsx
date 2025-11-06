import "./History.css";
import React from "react";
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

function History() {
  const temp = [
    { time: "10:00", temperature: 18 },
    { time: "11:00", temperature: 19 },
    { time: "12:00", temperature: 21 },
    { time: "13:00", temperature: 20 },
    { time: "14:00", temperature: 22 },
    { time: "15:00", temperature: 23 },
    { time: "16:00", temperature: 21 },
    { time: "17:00", temperature: 20 },
    { time: "18:00", temperature: 20 },
    { time: "19:00", temperature: 18 },
    { time: "20:00", temperature: 17 },
    { time: "21:00", temperature: 16 },
    { time: "22:00", temperature: 14 },
  ];

  const hum = [
    { time: "10:00", humidity: 60 },
    { time: "11:00", humidity: 58 },
    { time: "12:00", humidity: 55 },
    { time: "13:00", humidity: 57 },
    { time: "14:00", humidity: 54 },
    { time: "15:00", humidity: 53 },
    { time: "16:00", humidity: 56 },
    { time: "17:00", humidity: 58 },
    { time: "18:00", humidity: 59 },
    { time: "19:00", humidity: 61 },
    { time: "20:00", humidity: 63 },
    { time: "21:00", humidity: 65 },
    { time: "22:00", humidity: 68 },
  ];
  // merge temperature and humidity arrays by time into a single dataset
  const data = temp.map((t) => {
    const found = hum.find((h) => h.time === t.time);
    return {
      time: t.time,
      temperature: t.temperature,
      humidity: found ? found.humidity : null,
    };
  });

  return (
    <div className="history">
      <div className="title">
        <h2>History</h2>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccccccff" />
          <XAxis dataKey="time" />
          {/* left axis for temperature */}
          <YAxis yAxisId="left" />
          {/* right axis for humidity */}
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#00377E"
            name="Temperature (°C)"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            stroke="#377E00"
            name="Humidity (%)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default History;
