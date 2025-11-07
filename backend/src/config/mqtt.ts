import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config()

const mqtt_client = mqtt.connect("mqtt://145.24.237.211:8883", {
    username: process.env.MQTTUSER,
    password: process.env.MQTTPASSWORD
})

export default mqtt_client