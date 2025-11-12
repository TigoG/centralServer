import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './WeatherMap.css';
import { NL_CENTER, NL_ZOOM, SENSOR_TYPES, STUDENT_NUMBER } from '../../config/constants';
import { subscribeToStation } from '../../utils/sensorBus';

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
      if (typeof value === 'boolean') {
        return `${value ? 'Yes' : 'No'}`;
      }
      if (typeof value === 'string') {
        return `${value === 'true' ? 'Yes' : 'No'}`;
      }
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

// Simple error boundary to show a friendly placeholder if leaflet fails
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error('Map error', err, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="weather-map__placeholder">Map placeholder</div>;
    }
    return this.props.children;
  }
}

function WeatherMap({ stations: propStations = null, focusId = null, onSelect = null }) {
  const [focusedStation, setFocusedStation] = useState(null);
  const [mapCreated, setMapCreated] = useState(false);

  // internal stations used when parent doesn't provide stations prop
  const [internalStations] = useState(() => {
    const base = [
      { id: '1051804', name: 'Tigo Goes', lat: 51.8247, lon: 4.4126, location: 0 },
      { id: 'station-2', name: 'Station B', lat: 51.9244, lon: 4.4777, location: 1 },
      { id: 'station-3', name: 'Station C', lat: 52.0705, lon: 4.3007, location: 1 },
      { id: 'station-4', name: 'Station D', lat: 52.0910, lon: 5.1234, location: 0 },
      { id: 'station-5', name: 'Station E', lat: 51.4416, lon: 5.4697, location: 1 },
      { id: 'station-6', name: 'Station F', lat: 52.3702, lon: 4.8952, location: 1 },
    ];
    // start with empty sensors so popups remain empty until real data arrives
    return base.map((s) => ({ ...s, sensors: {} }));
  });

  const stations = propStations ?? internalStations;

  // If parent wants to focus a station, open its popup (store only id; popup will reference live station data)
  useEffect(() => {
    if (focusId === null || typeof focusId === 'undefined' || String(focusId) === '') return;
    const fid = String(focusId);
    const found = stations.find((s) => String(s?.id ?? '') === fid);
    if (found) setFocusedStation({ id: String(found.id), __openAt: Date.now() });
  }, [focusId, stations]);

  function FocusedPopup({ station, onClose }) {
    const map = useMap();

    // Use refs and direct DOM updates so the Popup element itself is not re-created
    // on every sensor update — only the text nodes are mutated to avoid flicker.
    const containerRef = useRef(null);
    const localSensorsRef = useRef({});
    const unsubscribeRef = useRef(null);

    useEffect(() => {
      if (!station) return;
      const liveMeta = stations.find((s) => s.id === station.id) || station;
      // center map on the station when opening
      map.panTo([liveMeta.lat, liveMeta.lon], { animate: true });

      // initialize from any available metadata sensors
      const initial = stations.find((s) => s.id === station.id)?.sensors || {};
      localSensorsRef.current = { ...initial };

      // ensure the popup DOM is initialized, then apply initial values
      const initTimeout = setTimeout(() => {
        updateDomWithSensors(localSensorsRef.current);
      }, 0);

      // subscribe to per-station updates (published by Layout via sensorBus)
      const unsubscribe = subscribeToStation(String(station.id), (update) => {
        // merge into local snapshot
        localSensorsRef.current = { ...localSensorsRef.current, ...update };
        // update only the DOM text nodes for changed sensors
        updateDomWithSensors(update);
      });
      unsubscribeRef.current = unsubscribe;

      return () => {
        clearTimeout(initTimeout);
        if (typeof unsubscribe === 'function') unsubscribe();
        unsubscribeRef.current = null;
      };
    }, [station?.id, map, stations]);

    // Update the popup DOM in-place based on the current snapshot.
    function updateDomWithSensors() {
      const container = containerRef.current;
      if (!container) return;

      const snapshot = localSensorsRef.current || {};

      // Build normalized sensor map (ignore keys containing "update")
      const cleanSensors = {};
      Object.entries(snapshot || {}).forEach(([rk, rv]) => {
        if (rv === -1 || rv === null || rv === undefined) return;
        const keyLower = String(rk || '').toLowerCase();
        if (keyLower.includes('update')) return;
        const normalized = keyLower.split('/')[0];
        if (!(normalized in cleanSensors)) cleanSensors[normalized] = rv;
      });

      // Required sensors: update their text (always render chips; hide section if none)
      const requiredSection = container.querySelector('[data-required-section]');
      let hasRequired = false;
      REQUIRED_SENSORS.forEach((k) => {
        const el = container.querySelector(`[data-sensor="${k}"]`);
        const valueSpan = el ? el.querySelector('.sensor-value') : null;
        const v = cleanSensors[k];
        if (v === -1 || v === null || typeof v === 'undefined') {
          if (valueSpan) valueSpan.textContent = '—';
          if (el) el.style.display = '';
        } else {
          hasRequired = true;
          if (valueSpan) valueSpan.textContent = formatSensorValue(k, v);
          if (el) el.style.display = '';
        }
      });
      if (requiredSection) requiredSection.style.display = hasRequired ? '' : 'none';

      // Optional sensors: show/hide list items based on presence and update their values
      const optionalSection = container.querySelector('[data-optional-section]');
      let hasOptional = false;
      OPTIONAL_SENSORS.forEach((k) => {
        const el = container.querySelector(`[data-sensor="${k}"]`);
        const valueSpan = el ? el.querySelector('.sensor-value') : null;
        const v = cleanSensors[k];
        if (v === -1 || v === null || typeof v === 'undefined') {
          if (el) el.style.display = 'none';
        } else {
          hasOptional = true;
          if (valueSpan) valueSpan.textContent = formatSensorValue(k, v);
          if (el) el.style.display = '';
        }
      });
      if (optionalSection) optionalSection.style.display = hasOptional ? '' : 'none';

      // No-data message: visible only when neither required nor optional sensors present
      const noDataEl = container.querySelector('[data-no-data]');
      if (noDataEl) {
        noDataEl.style.display = hasRequired || hasOptional ? 'none' : '';
      }
    }

    if (!station) return null;

    // station metadata (stable) — use for name/coords/location
    const meta = stations.find((s) => s.id === station.id) || station;

    const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 };
    const chipStyle = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 14, background: '#f1f5f9', marginRight: 8, marginBottom: 8, fontSize: 14 };
    const sensorKeyStyle = { fontWeight: 700, marginRight: 6, textTransform: 'capitalize' };
    const linkStyle = { color: '#0b7285', textDecoration: 'none' };

    return (
      <Popup key={station.__openAt || station.id} position={[meta.lat, meta.lon]} onClose={onClose} closeButton>
        <div ref={containerRef} style={{ minWidth: 300, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
          <div style={headerStyle}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{meta.name}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                ID: {meta.id} • {meta.location === 0 ? 'Binnen' : 'Buiten'}
              </div>
            </div>
            <div>
              <button onClick={onClose} style={{ border: 'none', background: '#e2e8f0', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
            </div>
          </div>

          {/* Required sensors section (render chips for each required sensor). */}
          <div data-required-section style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {REQUIRED_SENSORS.map((k) => (
                <div key={k} data-sensor={k} style={chipStyle}>
                  <span style={sensorKeyStyle}>{k}</span>
                  <span className="sensor-value" style={{ color: '#0f172a' }}>
                    {formatSensorValue(k, localSensorsRef.current[k]) ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional sensors section (each optional sensor is a stable list item that is hidden/shown via DOM updates). */}
          <div data-optional-section>
            <hr style={{ margin: '10px 0' }} />
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Other sensors</div>
            <div>
              <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                {OPTIONAL_SENSORS.map((k) => {
                  const v = localSensorsRef.current[k];
                  const visible = v !== -1 && v !== null && typeof v !== 'undefined';
                  return (
                    <li key={k} data-sensor={k} style={{ marginBottom: 8, display: visible ? '' : 'none' }}>
                      <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{k}</span>
                      <span>: </span>
                      <span className="sensor-value" style={{ color: '#0f172a' }}>{formatSensorValue(k, v)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div data-no-data style={{ marginTop: 10, color: '#475569', display: 'none' }}>No sensor data available</div>
        </div>
      </Popup>
    );
  }

  // Basic guard for environments where leaflet can't run
  const canRenderMap = typeof window !== 'undefined' && !!L && !!MapContainer;

  if (!canRenderMap) {
    return (
      <div className="weather-map">
        <div className="weather-map__placeholder">Map placeholder</div>
      </div>
    );
  }

  return (
    <div className="weather-map" role="region" aria-label="Weather stations map" style={{ height: '100%', width: '100%' }}>
      <MapErrorBoundary fallback={<div className="weather-map__placeholder">Map placeholder</div>}>
        <MapContainer
          center={NL_CENTER}
          zoom={NL_ZOOM}
          className="leaflet-container"
          style={{ height: '100%', width: '100%' }}
          whenCreated={() => setMapCreated(true)}
        >
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {stations.map((s) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lon]}
              eventHandlers={{
                click: () => {
                  // only store id+open timestamp here; popup will read live sensors from `stations`
                  setFocusedStation({ id: s.id, __openAt: Date.now() });
                  if (typeof onSelect === 'function') onSelect(s.id);
                },
              }}
            />
          ))}

          {focusedStation && <FocusedPopup station={focusedStation} onClose={() => { setFocusedStation(null); if (typeof onSelect === 'function') onSelect(null); }} />}
        </MapContainer>
      </MapErrorBoundary>
    </div>
  );
}

// Memoize the WeatherMap so UI-only ticks in the parent don't force re-renders.
// This prevents the map/popups from "flashing" when Layout updates its tick.
export default React.memo(WeatherMap);