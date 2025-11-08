import React, { useState, useEffect } from "react";
import "./Layout.css";
import Controls from "../Controls/Controls.jsx";
import WeatherMap, { generateSensors } from "../WeatherMap/WeatherMap.jsx";
import WeatherCard from "../WeatherCard/WeatherCard.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";
import Model from "../Model/Model.jsx";
import { STUDENT_NUMBER, NL_CENTER } from "../../config/constants";
import MQTTModule from "../MQTTModule/MQTTModule.jsx";
import { GetStations } from "../BackendConnection/BackendConnection.jsx";

export default function Layout() {
  const [stations, setStations] = useState([]);
  const [focusId, setFocusId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    id: STUDENT_NUMBER,
    student_number: "",
    latitude: String(NL_CENTER[0]),
    longitude: String(NL_CENTER[1]),
    location: "1",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [tick, setTick] = useState(Date.now());
  // MQTT client instance (set by MQTTModule via onClient)
  const [mqttClient, setMqttClient] = useState(null);

  function addStation() {
    const id = (addForm.id || "").trim();
    const student_number =
      (addForm.student_number || "").trim() || `Station ${id}`;
    const latitude = Number(addForm.latitude);
    const longitude = Number(addForm.longitude);
    const location = Number(addForm.location) === 0 ? 0 : 1;

    if (!id) {
      setSearchError("ID is required");
      return;
    }
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setSearchError("Latitude and longitude must be numbers");
      return;
    }
    if (stations.some((s) => s.id === id)) {
      setSearchError("Station ID already exists");
      return;
    }

    // normalize to frontend shape expected by WeatherMap and WeatherCard
    const newStation = {
      id,
      student_number,
      name: student_number,
      lat: latitude,
      lon: longitude,
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
      stations.find((s) => s.student_number === q) ||
      stations.find(
        (s) => s.student_number.includes(q) || q.includes(s.student_number)
      ) ||
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
    console.log("MQTT raw:", topic, payload);

    const parts = String(topic).split("/");

    // Expect: homestations / stationId / location / sensorType
    if (parts.length < 4 || parts[0].toLowerCase() !== "homestations") {
      console.warn("MQTT topic not recognized:", topic);
      return;
    }

    const stationId = parts[1];
    const location = Number(parts[2]);
    const sensorType = parts[3].toLowerCase();

    // ✅ Value always from payload
    const value = Number(String(payload));
    if (isNaN(value)) {
      console.warn("Invalid payload value:", payload);
      return;
    }

    console.log("Parsed MQTT:", { stationId, location, sensorType, value });

    setMqttData({
      stationId,
      location,
      value: { [sensorType]: value },
    });
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
      console.log(
        "Updating station:",
        stationId,
        "Location:",
        location,
        "Value:",
        value
      );
      setStations((prevStations) =>
        prevStations.map((station) => {
          if (station.id === stationId && station.location === location) {
            return {
              ...station,
              sensors: {
                ...station.sensors,
                ...value,
              },
            };
          }
          return station;
        })
      );
    }
  }, [mqttData]);

  // Publish an actuator command for a station
  function publishActuator(station, value = 1) {
    if (!mqttClient) {
      console.warn("No MQTT client available to publish actuator command");
      return;
    }
    // mqtt.js client exposes `.connected` boolean in browser builds
    if (mqttClient.connected === false) {
      console.warn("MQTT client not connected");
      return;
    }

    const student = station.student_number || station.id || "unknown";
    const location = typeof station.location !== "undefined" ? station.location : 1;
    const topic = `homestations/${student}/${location}/motor`;
    const payload = String(value);

    mqttClient.publish(topic, payload, (err) => {
      if (err) {
        console.error("Failed to publish actuator command:", err);
      } else {
        console.log("Published actuator command:", topic, payload);
      }
    });
  }

  useEffect(() => {
    // Fetch stations from backend on mount
    async function fetchStations() {
      try {
        const data = await GetStations();
        console.log("Fetched stations from backend:", data);
        // Normalize backend station objects to the frontend shape expected by WeatherMap and WeatherCard.
        // Backend may return fields like latitude/longitude or lat/lon and different name keys.
        const normalized = (Array.isArray(data) ? data : []).map((s) => {
          const id =
            s.id ??
            s.station_id ??
            String(s.student_number ?? s.name ?? Math.random());
          const student_number =
            s.student_number ?? s.name ?? s.id ?? `Station ${id}`;
          const lat = Number(
            s.lat ?? s.latitude ?? s.latitude_deg ?? s.latitudeDegrees ?? null
          );
          const lon = Number(
            s.lon ??
              s.longitude ??
              s.longitude_deg ??
              s.longitudeDegrees ??
              null
          );
          const location = Number(s.location ?? s.location_id ?? 1);
          return {
            id,
            student_number,
            name: student_number,
            lat: Number.isFinite(lat) ? lat : NL_CENTER[0],
            lon: Number.isFinite(lon) ? lon : NL_CENTER[1],
            location,
            sensors: s.sensors ?? s.latest_sensors ?? generateSensors(),
          };
        });
        setStations(normalized);
      } catch (err) {
        console.error("Error fetching stations:", err);
      }
    }
    fetchStations();
  }, []);

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
              {stations.length === 0 ? (
                <div className="no_stations">No stations found...</div>
              ) : (
                stations.map((s) => (
                  <WeatherCard
                    key={s.id}
                    station={s}
                    onFocus={() => setFocusId(s.id)}
                    tick={tick}
                    onActuator={() => publishActuator(s, 1)}
                  />
                ))
              )}
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
      <MQTTModule onMessage={handleMqttMessage} onClient={setMqttClient} />
    </div>
  );
}
