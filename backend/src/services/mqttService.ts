import mqtt_client from "../config/mqtt";
import pool from "../config/db";

const ACCEPT_DATABASE = [
  "temperature",
  "windspeed",
  "humidity",
  "uv",
  "light",
  "airpressure",
  "altitude",
  "soilmoisture",
  "rain",
  "flowrate",
  "winddirection",
  "gasresistance",
];

const deviceRowMap = new Map<string, number>();
const deviceLocks = new Map<string, Promise<void>>();

export const initializeMQTT = () => {
  mqtt_client.on("connect", () => {
    console.log("Connected to MQTT");
    mqtt_client.subscribe("homestations/#", (err) => {
      if (!err) console.log("Subscribed to homestations/#");
    });
  });

  mqtt_client.on("message", (topic, message) => {
    const value = message.toString();
    const parts = topic.split("/");
    const studentnumber = parts[1];
    const location = parts[2];
    const sensortype = parts[3];

    const key = `${studentnumber}_${location}`;

    if (!ACCEPT_DATABASE.includes(sensortype)) {
      if (sensortype === "update") {
        deviceRowMap.delete(key);
      }
      return;
    }

    const previousOp = deviceLocks.get(key) ?? Promise.resolve();

    const newOp = previousOp.then(async () => {
      // ... existing database operation code ...
      const client = await pool.connect();
      try {
        if (deviceRowMap.has(key)) {
          // UPDATE existing row
          const idquery = deviceRowMap.get(key)!;
          await client.query(
            `UPDATE sensor_data SET ${sensortype} = $1 WHERE id = $2`,
            [value, idquery],
          );
          console.log(
            `✅ Updated ${sensortype} for ${studentnumber} id: ${idquery}`,
          );
        } else {
          // INSERT new row
          const res = await client.query(
            `
            WITH ins AS (
            INSERT INTO stations (student_number, location)
            VALUES ($1, $2)
            ON CONFLICT (student_number, location) DO NOTHING
            RETURNING id
            )
            INSERT INTO sensor_data (station_id, ${sensortype})
            VALUES (
            (SELECT id FROM ins
            UNION
            SELECT id FROM stations
            WHERE student_number = $1 AND location = $2),
            $3
            )
            RETURNING id;
            `,
            [studentnumber, location, value],
          );
          const idquery = res.rows[0].id;
          deviceRowMap.set(key, idquery); // store the id for future updates
          console.log(
            `✅ Inserted ${sensortype} for ${studentnumber}, id: ${idquery}`,
          );
        }
      } catch (err) {
        console.error("❌ DB error:", err);
      } finally {
        client.release();
      }
    });

    deviceLocks.set(key, newOp);
  });
};

export default initializeMQTT;
