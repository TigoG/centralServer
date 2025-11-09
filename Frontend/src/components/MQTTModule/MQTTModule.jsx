import React, { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';

const MQTTComponent = ({
  onMessage,
  onClient,
  brokerUrl = 'ws://145.24.237.211:8080',
  username = 'minor_smart_things',
  password = 'smart_things_2025',
  subscribeTopic = 'homestations/#',
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const clientRef = useRef(null);
  const handlersRef = useRef({ onMessage, onClient });

  // keep latest handlers in a ref so the connection effect can remain stable
  useEffect(() => {
    handlersRef.current.onMessage = onMessage;
    handlersRef.current.onClient = onClient;
  }, [onMessage, onClient]);

  useEffect(() => {
    const options = {
      keepalive: 30,
      clientId: 'react_mqtt_' + Math.random().toString(16).substr(2, 8),
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      username,
      password,
    };

    const newClient = mqtt.connect(brokerUrl, options);
    clientRef.current = newClient;

    const handleConnect = () => {
      console.log('Connected to MQTT broker');
      setIsConnected(true);

      if (subscribeTopic) {
        newClient.subscribe(subscribeTopic, (err) => {
          if (!err) {
            console.log('Subscribed to topic:', subscribeTopic);
          } else {
            console.error('Subscribe error', err);
          }
        });
      }

      if (typeof handlersRef.current.onClient === 'function') {
        handlersRef.current.onClient(newClient);
      }
    };

    const handleMessage = (topic, payload) => {
      const str = payload.toString();
      console.log(`Received Message: ${str} on topic: ${topic}`);
      setMessage(str);
      if (typeof handlersRef.current.onMessage === 'function') {
        handlersRef.current.onMessage(topic, str);
      }
    };

    const handleError = (err) => {
      // Log errors but don't forcibly call .end() here. Forcing end leads to
      // the "client disconnecting" subscribe errors when the effect is re-run.
      console.error('MQTT client error:', err);
    };

    const handleClose = () => {
      console.warn('MQTT connection closed');
      setIsConnected(false);
    };

    const handleOffline = () => {
      console.warn('MQTT client offline');
      setIsConnected(false);
    };

    newClient.on('connect', handleConnect);
    newClient.on('message', handleMessage);
    newClient.on('error', handleError);
    newClient.on('close', handleClose);
    newClient.on('offline', handleOffline);

    return () => {
      try {
        if (newClient) {
          newClient.removeListener('connect', handleConnect);
          newClient.removeListener('message', handleMessage);
          newClient.removeListener('error', handleError);
          newClient.removeListener('close', handleClose);
          newClient.removeListener('offline', handleOffline);
          newClient.end(true);
        }
      } catch (e) {
        console.error('Error during MQTT cleanup', e);
      } finally {
        clientRef.current = null;
      }
    };
    // keep the effect stable — do not include onMessage/onClient here
  }, [brokerUrl, username, password, subscribeTopic]);

  // Safe publish wrapper using clientRef
  const publishMessage = (topic, payload, options = {}) => {
    const client = clientRef.current;
    if (client && client.connected) {
      client.publish(topic, String(payload), options, (err) => {
        if (err) {
          console.error('Publish error:', err);
        } else {
          console.log('Published', topic, payload);
        }
      });
    } else {
      console.warn('Cannot publish, MQTT client not connected yet');
    }
  };

  return (
    <div className="p-4" aria-hidden="true">
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        onClick={() =>
          publishMessage('HomestationDemo/homestations', '1060011/0/Temperature/14.2')
        }
        disabled={!isConnected}
      >
        Publish Message
      </button>
      <p className="mt-4">Received message: {message}</p>
    </div>
  );
};

export default MQTTComponent;
