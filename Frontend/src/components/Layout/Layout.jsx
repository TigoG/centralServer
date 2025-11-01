import React, { useState, useEffect } from "react";
import "./Layout.css";
import Controls from "../Controls/Controls.jsx";
import Footer from "../Footer/Footer.jsx";
import WeatherMap, { generateSensors } from "../WeatherMap/WeatherMap.jsx";
import WeatherCard from "../WeatherCard/WeatherCard.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";
import Model from "../Model/Model.jsx";
import { STUDENT_NUMBER, NL_CENTER } from "../../config/constants";
import MQTTModule from '../MQTTModule/MQTTModule.jsx';

export default function Layout() {
  const [stations, setStations] = useState(() => {
    const base = [
      { id: "1051804", name: "Tigo Goes", lat: 51.8247, lon: 4.4126, location: 0 },
      { id: "station-2", name: "Station B", lat: 51.9244, lon: 4.4777, location: 1 },
      { id: "station-3", name: "Station C", lat: 52.0705, lon: 4.3007, location: 1 },
      { id: "station-4", name: "Station D", lat: 52.091, lon: 5.1234, location: 0 },
      { id: "station-5", name: "Station E", lat: 51.4416, lon: 5.4697, location: 1 },
      { id: "station-6", name: "Station F", lat: 52.3702, lon: 4.8952, location: 1 },
    ];
    return base.map((s) => ({ ...s, sensors: generateSensors() }));
  });

  const [focusId, setFocusId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    id: STUDENT_NUMBER,
    name: "",
    lat: String(NL_CENTER[0]),
    lon: String(NL_CENTER[1]),
    location: "1",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [tick, setTick] = useState(Date.now());

  function addStation() {
    const id = (addForm.id || "").trim();
    const name = (addForm.name || "").trim() || `Station ${id}`;
    const lat = Number(addForm.lat);
    const lon = Number(addForm.lon);
    const location = Number(addForm.location) === 0 ? 0 : 1;

    if (!id) {
      setSearchError("ID is required");
      return;
    }
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setSearchError("Latitude and longitude must be numbers");
      return;
    }
    if (stations.some((s) => s.id === id)) {
      setSearchError("Station ID already exists");
      return;
    }

    const newStation = {
      id,
      name,
      lat,
      lon,
      location,
      sensors: generateSensors(),
    };
    setStations((prev) => [...prev, newStation]);

    // focus newly added station on map
    setFocusId(null);
    setTimeout(() => setFocusId(id), 50);

    setShowAddForm(false);
    setShowAddModal(false);
    setSearchError(null);
  }

  function handleSearch(qArg) {
    const q = (qArg ?? searchQuery ?? "").trim();
    if (!q) {
      setSearchError("Enter something to search");
      return;
    }

    const found =
      stations.find((s) => s.id === q) ||
      stations.find((s) => s.id.includes(q) || q.includes(s.id)) ||
      stations.find((s) => s.name === q) ||
      stations.find((s) => s.name.includes(q) || q.includes(s.name)) ||
      stations.find((s) => String(s.location) === q); // fix: convert number to string

    if (!found) {
      setSearchError(`No station found for '${q}'`);
      return;
    }

    setFocusId(null);
    setTimeout(() => setFocusId(found.id), 50);
    setSearchError(null);
  }

  
  // 1. Add state for MQTT data
  const [mqttData, setMqttData] = useState(null);

  // 2. Callback to handle MQTT messages
  // Example topic: HomestationDemo/homestations/1051804/0/sensors/value
  function handleMqttMessage(topic, payload) {
    console.log('MQTT raw:', topic, payload);

    const parts = String(topic).split('/');
    // find the "homestations" segment and parse after it
    const hsIndex = parts.findIndex((p) => p.toLowerCase() === 'homestations');
    if (hsIndex === -1 || parts.length <= hsIndex + 4) {
      console.warn('MQTT topic does not contain expected homestations/... path:', topic);
      return;
    }

    const stationId = parts[hsIndex + 1];
    const location = Number(parts[hsIndex + 2]);
    const sensorType = parts[hsIndex + 3];
    // topic may carry the value as last segment or payload may contain the numeric value
    let value = parts[hsIndex + 4];
    if (value === '' || value == null || isNaN(Number(value))) {
      // try payload as numeric value fallback
      const pv = Number(String(payload));
      if (!isNaN(pv)) value = pv;
    } else {
      value = Number(value);
    }

    console.log('Parsed MQTT Data - stationId:', stationId, 'location:', location, 'sensorType:', sensorType, 'value:', value);

    if (!stationId || isNaN(location) || isNaN(Number(value))) {
      console.warn('Invalid parsed MQTT values:', { stationId, location, value });
      return;
    }

    const sensorValues = { [sensorType.toLowerCase()]: Number(value) };
    setMqttData({ stationId: String(stationId), location: Number(location), value: sensorValues });
  }

  // // Periodically regenerate sensors and update tick so popups show live sensor values.
  // // Adjust intervalMs (milliseconds) as desired.
  // useEffect(() => {
  //   const intervalMs = 1000; // update every 5 seconds
  //   const id = setInterval(() => {
  //     setStations((prev) => prev.map((s) => ({ ...s, sensors: generateSensors() })));
  //     setTick(Date.now());
  //   }, intervalMs);
  
  //   return () => clearInterval(id);
  // }, []);

  //Replace the existing useEffect with this new one
  useEffect(() => {
    if (mqttData) {
      const { stationId, location, value } = mqttData;
      console.log('Updating station:', stationId, 'Location:', location, 'Value:', value);
      setStations(prevStations => 
        prevStations.map(station => {
          if (station.id === stationId && station.location === location) {
            return {
              ...station,
              sensors: {
                ...station.sensors,
                ...value
              }
            };
          }
          return station;
        })
      );
    }
  }, [mqttData]);

  return (
    <div className="app">
      <div className="app-body">
        
        <div className="stations-area">
          <SearchBar
            onSearch={(q) => {
              setSearchQuery(q);
              handleSearch(q);
            }}
          />
          {/* show search errors directly under the search bar */}
          {searchError && (
            <div
              className="form-error"
              role="alert"
              style={{ margin: "8px 0" }}
            >
              {searchError}
            </div>
          )}

          <div className="homestation-table" aria-label="Stations list">
            <section className="weather-list" aria-live="polite">
              {stations.map((s) => (
                <WeatherCard key={s.id} station={s} onFocus={() => setFocusId(s.id)} tick={tick} />
              ))}
            </section>

            <button
              type="button"
              className="add-station-fab"
              onClick={() => {
                setShowAddModal(true);
                setShowAddForm(false);
                setSearchError(null);
              }}
              aria-label="Add station"
            >
              + Add Station
            </button>
          </div>
        </div>

        <div className="map-and-controls">
          <div className="controls-area">
            <Controls
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
              showAddModal={showAddModal}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchError={searchError}
              setSearchError={setSearchError}
              addForm={addForm}
              setAddForm={setAddForm}
              handleSearch={handleSearch}
              addStation={addStation}
            />
          </div>

          <main className="map-wrap">
            <WeatherMap stations={stations} focusId={focusId} />
          </main>
        </div>
      </div>

      <Model
        show={showAddModal}
        setShow={setShowAddModal}
        setShowAddForm={setShowAddForm}
        addForm={addForm}
        setAddForm={setAddForm}
        addStation={addStation}
        searchError={searchError}
        setSearchError={setSearchError}
      />
      <MQTTModule onMessage={handleMqttMessage} />
    </div>
    
  );
}
