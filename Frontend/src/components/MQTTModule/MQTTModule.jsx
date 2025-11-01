import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MQTTComponent = (props) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Example broker: test.mosquitto.org (public broker)
    const brokerUrl = 'wss://test.mosquitto.org:8081'; // Use ws:// or wss:// for browsers

    const options = {
      keepalive: 30,
      clientId: 'react_mqtt_' + Math.random().toString(16).substr(2, 8),
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    };

    const newClient = mqtt.connect(brokerUrl, options);

    newClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      setIsConnected(true);
      newClient.subscribe('HomestationDemo/homestations/#', (err) => {
        if (!err) {
          console.log('Subscribed to topic: HomestationDemo/homestations/#');
        }
      });
    });

    newClient.on('message', (topic, payload) => {
      console.log(`Received Message: ${payload.toString()} on topic: ${topic}`);
      setMessage(payload.toString());
            if (props.onMessage) {
        props.onMessage(topic, payload.toString());
      }
      //setValue(payload.toString());
    });

    newClient.on('error', (err) => {
      console.error('Connection error: ', err);
      newClient.end();
    });

    setClient(newClient);

    return () => {
      if (newClient) {
        newClient.end();
      }
    };
  }, []);

  // Function to publish a message
  const publishMessage = () => {
    if (client && isConnected) {
      client.publish('HomestationDemo/homestations', '1060011/0/Temperature/14.2');
    }
  };

  return (
    <div className="p-4">
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        onClick={publishMessage}
        disabled={!isConnected}
      >
        Publish Message
      </button>
      <p className="mt-4">Received message: {message}</p>
    </div>
  );
};

export default MQTTComponent;
