// WeatherMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../App.css';
import { NL_CENTER, NL_ZOOM, SENSOR_TYPES, STUDENT_NUMBER } from '../config/constants';

// Fix default icon path (for Leaflet markers served from CDN)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// required sensors
const REQUIRED_SENSORS = ['temperature', 'windspeed', 'humidity'];
const OPTIONAL_SENSORS = SENSOR_TYPES.filter((s) => !REQUIRED_SENSORS.includes(s));

function formatSensorValue(sensor, value) {
  if (value === -1 || value === null || value === undefined) return null;
  switch (sensor) {
    case 'temperature':
      return `${Number(value).toFixed(1)} °C`;
    case 'windspeed':
      return `${Number(value).toFixed(1)} km/h`;
    case 'humidity':
      return `${Math.round(value)} %`;
    case 'light':
      return `${Math.round(value)} lux`;
    case 'uv':
      return `${parseInt(value, 10)}`;
    case 'airpresure':
      return `${Math.round(value)} Pa`;
    case 'altitude':
      return `${Math.round(value)} m`;
    case 'soilmoisture':
      return `${Math.round(value)} %`;
    case 'rain':
      return `${Number(value).toFixed(1)} mm`;
    case 'flowrate':
      return `${Number(value).toFixed(2)} L/min`;
    case 'winddirection':
      return `${value}`;
    case 'gasresistance':
      return `${Number(value).toFixed(2)} kΩ`;
    default:
      return `${value}`;
  }
}

export const generateSensors = () => {
  const out = {};
  // required sensors always present
  out.temperature = +(Math.random() * 15 + 5).toFixed(1);
  out.windspeed = +(Math.random() * 50).toFixed(1);
  out.humidity = Math.round(Math.random() * 60 + 20);

  // optionals (35% chance)
  OPTIONAL_SENSORS.forEach((t) => {
    const present = Math.random() < 0.35;
    if (!present) {
      out[t] = -1;
      return;
    }
    switch (t) {
      case 'light':
        out[t] = Math.round(Math.random() * 20000);
        break;
      case 'uv':
        out[t] = Math.floor(Math.random() * 12);
        break;
      case 'airpresure':
        out[t] = Math.round(100000 + Math.random() * 3000);
        break;
      case 'altitude':
        out[t] = Math.round(Math.random() * 400);
        break;
      case 'soilmoisture':
        out[t] = Math.round(Math.random() * 100);
        break;
      case 'rain':
        out[t] = +(Math.random() * 20).toFixed(1);
        break;
      case 'flowrate':
        out[t] = +(Math.random() * 10).toFixed(2);
        break;
      case 'winddirection':
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        out[t] = dirs[Math.floor(Math.random() * dirs.length)];
        break;
      case 'gasresistance':
        out[t] = +(Math.random() * 10).toFixed(2);
        break;
      default:
        out[t] = -1;
    }
  });

  return out;
};

export default function WeatherMap({ stations: propStations = null, focusId = null }) {
  const [focusedStation, setFocusedStation] = useState(null);

  // internal stations used when parent doesn't provide stations prop
  const [internalStations, setInternalStations] = useState(() => {
    const base = [
      { id: '1051804', name: 'Tigo Goes', lat: 51.8247, lon: 4.4126, location: 0 },
      { id: 'station-2', name: 'Station B', lat: 51.9244, lon: 4.4777, location: 1 },
      { id: 'station-3', name: 'Station C', lat: 52.0705, lon: 4.3007, location: 1 },
      { id: 'station-4', name: 'Station D', lat: 52.0910, lon: 5.1234, location: 0 },
      { id: 'station-5', name: 'Station E', lat: 51.4416, lon: 5.4697, location: 1 },
      { id: 'station-6', name: 'Station F', lat: 52.3702, lon: 4.8952, location: 1 },
    ];
    return base.map((s) => ({ ...s, sensors: generateSensors() }));
  });

  const stations = propStations ?? internalStations;

  // If parent wants to focus a station, open its popup
  useEffect(() => {
    if (!focusId) return;
    const found = stations.find((s) => s.id === focusId || s.id.includes(focusId) || focusId.includes(s.id));
    if (found) setFocusedStation({ ...found, __openAt: Date.now() });
  }, [focusId, stations]);

  function FocusedPopup({ station, onClose }) {
    const map = useMap();

    useEffect(() => {
      if (!station) return;
      map.panTo([station.lat, station.lon], { animate: true });
    }, [station, map]);

    if (!station) return null;

    const requiredEntries = REQUIRED_SENSORS.map((k) => [k, station.sensors?.[k]]);
    const optionalEntries = Object.entries(station.sensors || {}).filter(
      ([k, v]) => !REQUIRED_SENSORS.includes(k) && v !== -1 && v !== null && v !== undefined
    );

    const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 };
    const chipStyle = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 14, background: '#f1f5f9', marginRight: 8, marginBottom: 8, fontSize: 14 };
    const sensorKeyStyle = { fontWeight: 700, marginRight: 6, textTransform: 'capitalize' };
    const linkStyle = { color: '#0b7285', textDecoration: 'none' };

    return (
      <Popup key={station.__openAt || station.id} position={[station.lat, station.lon]} onClose={onClose} closeButton>
        <div style={{ minWidth: 300, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
          <div style={headerStyle}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{station.name}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                ID: {station.id} • {station.location === 0 ? 'Binnen' : 'Buiten'}
              </div>
            </div>
            <div>
              <button onClick={onClose} style={{ border: 'none', background: '#e2e8f0', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {requiredEntries.map(([k, v]) => (
                <div key={k} style={chipStyle}>
                  <span style={sensorKeyStyle}>{k}</span>
                  <span style={{ color: '#0f172a' }}>{formatSensorValue(k, v) ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {optionalEntries.length > 0 && (
            <>
              <hr style={{ margin: '10px 0' }} />
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Other sensors</div>
              <div>
                <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                  {optionalEntries.map(([k, v]) => (
                    <li key={k} style={{ marginBottom: 8 }}>
                      <a style={linkStyle} href={`/homestations/${STUDENT_NUMBER}/${station.location}/${k}`} target="_blank" rel="noopener noreferrer">
                        <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{k}</span>: <span style={{ color: '#0f172a' }}>{formatSensorValue(k, v)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </Popup>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={NL_CENTER} zoom={NL_ZOOM} className="leaflet-container">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {stations.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lon]}
            eventHandlers={{
              click: () => {
                setFocusedStation({ ...s, sensors: s.sensors, __openAt: Date.now() });
              },
            }}
          />
        ))}

        {focusedStation && <FocusedPopup station={focusedStation} onClose={() => setFocusedStation(null)} />}
      </MapContainer>
    </div>
  );
}