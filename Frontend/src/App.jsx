import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix default icon path (for Leaflet markers served from CDN)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NL_CENTER = [52.1326, 5.2913]; // approximate center of the Netherlands
const NL_ZOOM = 7;

export default function App() {
  const sampleStations = [
    { id: 'station-1', name: 'Station A', lat: 51.8247, lon: 4.4126 },
    { id: 'station-2', name: 'Station B', lat: 51.9244, lon: 4.4777 },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>centralServer — Weather Stations</h1>
      </header>
      <main className="map-wrap">
        <MapContainer center={NL_CENTER} zoom={NL_ZOOM} className="leaflet-container">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {sampleStations.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lon]}>
              <Popup>
                <div><strong>{s.name}</strong></div>
                <div>ID: {s.id}</div>
                <div>Lat: {s.lat}, Lon: {s.lon}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}
