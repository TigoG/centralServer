import React, { useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (onSearch) onSearch(query);
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
        <button type="submit" className="search-bar__btn">
          Search
        </button>
      </div>
    </form>
  );
}
