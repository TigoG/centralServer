import React, { useState } from "react";
import "./Layout.css";
import Header from "../Header/Header.jsx";
import Controls from "../Controls/Controls.jsx";
import Footer from "../Footer/Footer.jsx";
import Table from "../Table.jsx";
import WeatherMap, { generateSensors } from "../WeatherMap/WeatherMap.jsx";
import WeatherCard from "../WeatherCard/WeatherCard.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";
import { STUDENT_NUMBER, NL_CENTER } from "../../config/constants";

export default function Layout() {
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

    // focus newly added station on map
    setFocusId(null);
    setTimeout(() => setFocusId(id), 50);

    setShowAddForm(false);
    setSearchError(null);
  }

  // handleSearch optionally accepts a query string; if not provided, it uses
  // the controlled `searchQuery` state. This lets SearchBar call it directly.
  function handleSearch(qArg) {
    const q = (qArg ?? searchQuery ?? "").trim();
    if (!q) {
      setSearchError("Enter an ID to search");
      return;
    }
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
      <div className="app-body">
        <div className="stations-area">
          {/* Search bar above the homestation table */}
          <SearchBar
            onSearch={(q) => {
              // update local controlled input state (optional) and perform search
              setSearchQuery(q);
              handleSearch(q);
            }}
          />

          <div className="homestation-table" aria-label="Stations list">
            <section className="weather-list" aria-live="polite">
              {stations.map((s) => (
                <WeatherCard
                  key={s.id}
                  station={s}
                  onFocus={() => setFocusId(s.id)}
                />
              ))}
            </section>
          </div>
        </div>

        <div className="map-and-controls">
          <div className="controls-area">
            <Controls
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
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

          <footer className="app_footer">
            <Footer></Footer>
          </footer>
        </div>
      </div>
    </div>
  );
}
