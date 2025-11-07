import express from "express";
import dotenv from 'dotenv';
import pool from './config/db';
import router from "./routes/templateUserRouter";
import mqtt_client from "./config/mqtt";
const app = express();
const PORT = 8445;

// MQTT connection
mqtt_client.on("connect", () => {
    console.log("Connected to MQTT")
    mqtt_client.subscribe("homestations/#", (err) => {
       if (!err) console.log("Subscribed to homestations/#")
    })
    
})

const ACCEPT_DATABASE = [
  "temperature","windspeed","humidity","uv","light","airpressure",
  "altitude","soilmoisture","rain","flowrate","winddirection","gasresistance"
];

const deviceRowMap = new Map<string, number>(); // studentnumber + location => id

mqtt_client.on("message", async (topic, message) => {
  const value = message.toString();
  const parts = topic.split("/");
  const studentnumber = parts[1];
  const location = parts[2];
  const sensortype = parts[3];

  const key = `${studentnumber}_${location}`; // unique per device/location

  if (!ACCEPT_DATABASE.includes(sensortype)) {
    if (sensortype === "update") {
      deviceRowMap.delete(key); // reset row id for new insert
    }
    return; // ignore unaccepted sensors
  }

  const client = await pool.connect();
  try {
    if (deviceRowMap.has(key)) {
      // UPDATE existing row
      const idquery = deviceRowMap.get(key)!;
      await client.query(
        `UPDATE sensor_data SET ${sensortype} = $1 WHERE id = $2`,
        [value, idquery]
      );
      console.log(`✅ Updated ${sensortype} for ${studentnumber}`);
    } else {
      // INSERT new row
      const res = await client.query(
        `INSERT INTO sensor_data (${sensortype}) VALUES ($1) RETURNING id`,
        [value]
      );
      const idquery = res.rows[0].id;
      deviceRowMap.set(key, idquery); // store the id for future updates
      console.log(`✅ Inserted ${sensortype} for ${studentnumber}, id: ${idquery}`);
    }
  } catch (err) {
    console.error("❌ DB error:", err);
  } finally {
    client.release();
  }
});


dotenv.config();


app.use(express.json())
 
app.listen (
    PORT,
    () => console.log(`It's alive on http://localhost:${PORT}`)
)

app.use('', router);

