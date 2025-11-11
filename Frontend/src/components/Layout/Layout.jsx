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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [addForm, setAddForm] = useState({
    id: STUDENT_NUMBER,
    student_number: "",
    latitude: String(NL_CENTER[0]),
    longitude: String(NL_CENTER[1]),
    location: "1",
  });
  const [updateForm, setUpdateForm] = useState({
    student_number: "",
    latitude: String(NL_CENTER[0]),
    longitude: String(NL_CENTER[1]),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tick, setTick] = useState(Date.now());
  // MQTT client instance (set by MQTTModule via onClient)
  const [mqttClient, setMqttClient] = useState(null);

  // Normalize various location representations to numeric 0 (inside) or 1 (outside).
  // Accepts numbers, "0"/"1", "binnen"/"buiten", "inside"/"outside", and fuzzy matches.
  const normalizeLocation = (v) => {
    if (v === null || typeof v === "undefined") return 1;
    if (typeof v === "number" && !Number.isNaN(v)) return Number(v);
    const s = String(v).trim().toLowerCase();
    if (s === "") return 1;
    // explicit numeric strings
    if (s === "0") return 0;
    if (s === "1") return 1;
    // common localized keywords
    if (s === "binnen" || s === "inside" || s.includes("bin")) return 0;
    if (s === "buiten" || s === "outside" || s.includes("buit")) return 1;
    const n = Number(s);
    return Number.isFinite(n) ? n : 1;
  };

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

  // Submit update to remote endpoint to update station GPS
  async function updateStationGPS() {
    const student = String((updateForm.student_number ?? "")).trim();
    const lat = Number(updateForm.latitude);
    const lon = Number(updateForm.longitude);

    if (!student) {
      setUpdateError("Student number (llnummer) is required");
      return;
    }
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setUpdateError("Latitude and longitude must be numbers");
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    const url = `http://145.24.237.211:8000/updateStation?llnummer=${encodeURIComponent(
      student
    )}&latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}`;

    try {
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
      }

      // If we have the station locally, update its coords in the UI
      setStations((prev) =>
        prev.map((s) => {
          const sid = String(s.id ?? "");
          const sstudent = String(s.student_number ?? "");
          if (
            sid === student ||
            sstudent === student ||
            sid.includes(student) ||
            sstudent.includes(student)
          ) {
            return { ...s, lat, lon };
          }
          return s;
        })
      );

      setUpdateSuccess("Station GPS updated successfully");
      // close modal shortly after success
      setTimeout(() => {
        setShowUpdateModal(false);
      }, 800);
    } catch (err) {
      console.error("UpdateStation failed:", err);
      setUpdateError(err.message || String(err));
    } finally {
      setIsUpdating(false);
    }
  }

  function handleSearch(qArg, locArg = null) {
    const q = String((qArg ?? searchQuery ?? "")).trim();
    const loc = locArg === null || typeof locArg === "undefined" ? null : Number(locArg);

    if (!q) {
      setSearchError("Enter something to search");
      return;
    }

    const normalize = (v) => String(v ?? "").trim();

    const matchExactStudent = (s) => normalize(s.student_number) === q;
    const matchExactId = (s) => normalize(s.id) === q;
    const matchPartialStudent = (s) => normalize(s.student_number).includes(q);
    const matchPartialId = (s) => normalize(s.id).includes(q);

    // Candidates: prefer stations matching the chosen location first (if provided)
    let candidates = Array.isArray(stations) ? stations.slice() : [];
    if (loc !== null) {
      candidates = candidates.filter((s) => normalizeLocation(s.location) === Number(loc));
    }

    // Search order: exact student_number -> exact id -> partial student_number -> partial id
    let found =
      candidates.find(matchExactStudent) ||
      candidates.find(matchExactId) ||
      candidates.find(matchPartialStudent) ||
      candidates.find(matchPartialId);

    let relaxed = false;
    // If not found within the chosen location, try across all stations as a fallback
    if (!found && loc !== null) {
      found =
        stations.find(matchExactStudent) ||
        stations.find(matchExactId) ||
        stations.find(matchPartialStudent) ||
        stations.find(matchPartialId);
      if (found) relaxed = true;
    }

    if (!found) {
      setSearchError(`No station found for '${q}'${loc !== null ? ` (location=${loc})` : ""}`);
      return;
    }

    setFocusId(null);
    setTimeout(() => setFocusId(found.id), 50);

    // show a small hint when we had to relax the location filter; otherwise clear errors
    if (relaxed) {
      setSearchError(`No station with '${q}' found at the chosen location; focusing the closest match.`);
    } else {
      setSearchError(null);
    }
  }

  // 1. Add state for MQTT data
  const [mqttData, setMqttData] = useState(null);

  // 2. Callback to handle MQTT messages
  // Example topic variants:
  //  - homestations/<stationId>/<location>/<sensorType>  (preferred)
  //  - HomestationDemo/homestations/<stationId>/<location>/<sensorType> (possible prefix)
  function handleMqttMessage(topic, payload) {
    console.log("MQTT raw:", topic, payload);

    const parts = String(topic).split("/");
    // Find the 'homestations' segment so we tolerate prefixed topics
    const baseIdx = parts.findIndex((p) => p.toLowerCase() === "homestations");
    if (baseIdx === -1 || parts.length < baseIdx + 4) {
      console.warn("MQTT topic not recognized:", topic);
      return;
    }

    const stationIdRaw = parts[baseIdx + 1];
    const location = Number(parts[baseIdx + 2]);
    const sensorType = String(parts[baseIdx + 3]).toLowerCase();

    // Payload may be a simple numeric value or an encoded string like
    // "stationId/location/sensor/value". Try numeric parse first, then fallback.
    let value = Number(String(payload));
    if (isNaN(value)) {
      const pparts = String(payload).split("/");
      if (pparts.length >= 4) {
        // fallback payload format: .../value
        const maybeVal = Number(pparts[pparts.length - 1]);
        if (!isNaN(maybeVal)) {
          value = maybeVal;
        } else {
          console.warn("Invalid payload value:", payload);
          return;
        }
      } else {
        console.warn("Invalid payload value:", payload);
        return;
      }
    }

    const stationId = String(stationIdRaw);

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

  useEffect(() => {
    if (mqttData) {
      const { stationId, location, value } = mqttData;
      console.log("Updating station:", stationId, "Location:", location, "Value:", value);
      const locNum = Number(location);
      setStations((prevStations) =>
        prevStations.map((station) => {
          const sid = String(station.id ?? "");
          const sstudent = String(station.student_number ?? "");
          const matches =
            sid === stationId ||
            sstudent === stationId ||
            sid.includes(stationId) ||
            sstudent.includes(stationId);
  
          if (matches && Number(station.location) === locNum) {
            console.log("Applying MQTT update to station:", station.id || station.student_number);
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

    const stationKey = String(station.student_number ?? station.id ?? station.name ?? "unknown");
    const location = typeof station.location !== "undefined" ? station.location : 1;
    const topic = `homestations/${stationKey}/${location}/motor`;
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
          const id = String(s.id ?? s.station_id ?? s.student_number ?? s.name ?? Math.random());
          const student_number = String(s.student_number ?? s.name ?? s.id ?? `Station ${id}`);
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
          const rawLoc = s.location ?? s.location_id ?? 1;
          const location = normalizeLocation(rawLoc);
          return {
            id,
            student_number,
            name: student_number,
            lat: Number.isFinite(lat) ? lat : NL_CENTER[0],
            lon: Number.isFinite(lon) ? lon : NL_CENTER[1],
            location,
            sensors: s.sensors ?? s.latest_sensors ?? {},
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
            onSearch={(q, loc) => {
              setSearchQuery(q);
              handleSearch(q, loc);
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

            <div className="fab-group">
              <button
                type="button"
                className="fab-button add-station-fab"
                onClick={() => {
                  setShowAddModal(true);
                  setShowAddForm(false);
                  setSearchError(null);
                }}
                aria-label="Add station"
              >
                + Add Station
              </button>
 
              <button
                type="button"
                className="fab-button"
                onClick={() => {
                  setShowUpdateModal(true);
                  setUpdateError(null);
                  setUpdateSuccess(null);
                }}
                aria-label="Update station GPS"
              >
                Update GPS
              </button>
            </div>
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

      {showUpdateModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setShowUpdateModal(false);
            setUpdateError(null);
            setUpdateSuccess(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Update Station GPS</h2>

            <div className="modal-form">
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="update-llnummer" className="input-label">
                    Student Number (llnummer)
                  </label>
                  <input
                    id="update-llnummer"
                    className="controls-input"
                    type="text"
                    placeholder="e.g. 1058796"
                    value={updateForm.student_number}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, student_number: e.target.value }))
                    }
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="update-lat" className="input-label">Latitude</label>
                  <input
                    id="update-lat"
                    className="controls-input"
                    type="number"
                    step="any"
                    placeholder="51.0"
                    value={updateForm.latitude}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, latitude: e.target.value }))
                    }
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="update-lon" className="input-label">Longitude</label>
                  <input
                    id="update-lon"
                    className="controls-input"
                    type="number"
                    step="any"
                    placeholder="4.0"
                    value={updateForm.longitude}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, longitude: e.target.value }))
                    }
                  />
                </div>
              </div>

              {updateError && <div className="form-error" role="alert">{updateError}</div>}
              {updateSuccess && <div className="form-success" role="status">{updateSuccess}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="controls__btn"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateError(null);
                    setUpdateSuccess(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="controls__btn controls__btn--primary"
                  onClick={updateStationGPS}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
