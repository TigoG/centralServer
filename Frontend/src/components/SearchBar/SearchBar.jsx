import React, { useState } from "react";
import "./SearchBar.css";


export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (typeof onSearch === "function") {
      const loc = location === "" ? null : Number(location);
      onSearch(query.trim(), loc);
    }
  }

  return (
    <form
      className="search-bar"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search stations"
    >
      <div className="search-bar__inner">
        <input
          id="search-input"
          className="search-bar__input"
          type="text"
          placeholder="Search stations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Station"
        />
        <select
          className="search-bar__select"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Location"
          title="Filter by location (Both / Inside / Outside)"
        >
          <option value="">Both</option>
          <option value="0">Inside</option>
          <option value="1">Outside</option>
        </select>
        <button type="submit" className="search-bar__btn">
          Search
        </button>
      </div>
    </form>
  );
}
