import React, { useState } from "react";
import "./App.css";
import WeatherMap, { generateSensors } from "./components/WeatherMap.jsx";
import { STUDENT_NUMBER, NL_CENTER } from "./config/constants";
import Table from "./components/Table.jsx";

export default function App() {
  const [stations, setStations] = useState(() => {
    const base = [
      {
        id: "1051804",
        name: "Tigo Goes",
        lat: 51.8247,
        lon: 4.4126,
        location: 0,
      },
      {
        id: "station-2",
        name: "Station B",
        lat: 51.9244,
        lon: 4.4777,
        location: 1,
      },
      {
        id: "station-3",
        name: "Station C",
        lat: 52.0705,
        lon: 4.3007,
        location: 1,
      },
      {
        id: "station-4",
        name: "Station D",
        lat: 52.091,
        lon: 5.1234,
        location: 0,
      },
      {
        id: "station-5",
        name: "Station E",
        lat: 51.4416,
        lon: 5.4697,
        location: 1,
      },
      {
        id: "station-6",
        name: "Station F",
        lat: 52.3702,
        lon: 4.8952,
        location: 1,
      },
    ];
    return base.map((s) => ({ ...s, sensors: generateSensors() }));
  });

  const [focusId, setFocusId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    id: STUDENT_NUMBER,
    name: "",
    lat: String(NL_CENTER[0]),
    lon: String(NL_CENTER[1]),
    location: "1",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState(null);

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

    // trigger focus in WeatherMap (toggle to ensure re-open even if same id)
    setFocusId(null);
    setTimeout(() => setFocusId(id), 50);

    setShowAddForm(false);
    setSearchError(null);
  }

  function handleSearch() {
    const q = (searchQuery || "").trim();
    if (!q) {
      setSearchError("Enter an ID to search");
      return;
    }
    // exact then partial
    const found =
      stations.find((s) => s.id === q) ||
      stations.find((s) => s.id.includes(q) || q.includes(s.id));
    if (!found) {
      setSearchError("No station found for that ID");
      return;
    }

    setFocusId(null);
    setTimeout(() => setFocusId(found.id), 50);
    setSearchError(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>centralServer — Weather Stations</h1>
        <p>Smart Things 2025 - Hogescool Rotterdam</p>
      </header>

      <div className="app-body">
        <div className="homestation-table">
          <Table
            data={stations}
            selectedId={focusId}
            onSelect={(id) => {
              // toggle focusId to ensure WeatherMap opens popup even if same id
              setFocusId(null);
              setTimeout(() => setFocusId(id), 50);
            }}
          />
        </div>

        <div className="map-and-controls">
          {/* Controls: two large buttons side-by-side with fold-down panel */}
          <div className="controls-area">
            <div className="controls-row">
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  justifyContent: "center",
                  width: "90%",
                  margin: "0 auto",
                }}
              >
                <button
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: "12px 36px",
                    height: 56,
                    fontSize: 20,
                    borderRadius: 12,
                    marginTop: 8,
                  }}
                  onClick={() => {
                    setShowSearch((v) => !v);
                    setShowAddForm(false);
                    setSearchError(null);
                  }}
                >
                  Search
                </button>

                <button
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    padding: "12px 36px",
                    height: 56,
                    fontSize: 20,
                    borderRadius: 12,
                    marginTop: 8,
                    marginLeft: 8,
                  }}
                  onClick={() => {
                    setShowAddForm((v) => !v);
                    setShowSearch(false);
                    setSearchError(null);
                  }}
                >
                  {showAddForm ? "Close" : "Add weatherstation"}
                </button>
              </div>
            </div>

            {/* Fold-down panel anchored below the buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <div
                role="region"
                aria-hidden={!(showSearch || showAddForm)}
                style={{
                  width: "100%",
                  maxWidth: 900,
                  margin: "12px 10%",
                  overflow: "hidden",
                  transition:
                    "max-height 360ms ease, padding 300ms ease, box-shadow 300ms ease",
                  maxHeight: showSearch || showAddForm ? 520 : 0,
                  padding: showSearch || showAddForm ? "16px" : "0 16px",
                  boxSizing: "border-box",
                  background: "white",
                  borderRadius: 8,
                  boxShadow:
                    showSearch || showAddForm
                      ? "0 6px 18px rgba(15,23,42,0.06)"
                      : "none",
                }}
              >
                <div
                  style={{
                    opacity: showSearch || showAddForm ? 1 : 0,
                    transition: "opacity 220ms ease 120ms",
                    pointerEvents: showSearch || showAddForm ? "auto" : "none",
                  }}
                >
                  {showSearch && (
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <input
                        className="controls-input"
                        type="text"
                        placeholder="Search by ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearch();
                        }}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={handleSearch}
                      >
                        Search
                      </button>
                    </div>
                  )}

                  {showAddForm && (
                    <div
                      className="add-form"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <input
                        className="controls-input"
                        type="text"
                        placeholder="ID"
                        value={addForm.id}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, id: e.target.value }))
                        }
                      />
                      <input
                        className="controls-input"
                        type="text"
                        placeholder="Name"
                        value={addForm.name}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                      <div className="coord-row">
                        <input
                          className="controls-input"
                          type="number"
                          step="any"
                          placeholder="Lat"
                          value={addForm.lat}
                          onChange={(e) =>
                            setAddForm((f) => ({ ...f, lat: e.target.value }))
                          }
                        />
                        <input
                          className="controls-input"
                          type="number"
                          step="any"
                          placeholder="Lon"
                          value={addForm.lon}
                          onChange={(e) =>
                            setAddForm((f) => ({ ...f, lon: e.target.value }))
                          }
                        />
                      </div>
                      <select
                        className="controls-input"
                        value={addForm.location}
                        onChange={(e) =>
                          setAddForm((f) => ({
                            ...f,
                            location: e.target.value,
                          }))
                        }
                      >
                        <option value="0">Binnen</option>
                        <option value="1">Buiten</option>
                      </select>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 8,
                        }}
                      >
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowAddForm(false);
                            setSearchError(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={addStation}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {searchError && (
                    <div className="form-error" style={{ marginTop: 8 }}>
                      {searchError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <main className="map-wrap">
            <WeatherMap stations={stations} focusId={focusId} />
          </main>
        </div>
      </div>
    </div>
  );
}
