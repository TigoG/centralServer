import React from 'react';
import './Controls.css';

export default function Controls({
  showSearch,
  setShowSearch,
  showAddForm,
  setShowAddForm,
  searchQuery,
  setSearchQuery,
  searchError,
  setSearchError,
  addForm,
  setAddForm,
  handleSearch,
  addStation,
}) {
  function onToggleSearch() {
    setShowSearch((v) => !v);
    setShowAddForm(false);
    setSearchError(null);
  }

  function onToggleAdd() {
    setShowAddForm((v) => !v);
    setShowSearch(false);
    setSearchError(null);
  }

  return (
    <div className="controls">
      <div className="controls__buttons" role="group" aria-label="Controls">
        <button
          type="button"
          className="controls__btn controls__btn--primary"
          aria-pressed={showSearch}
          onClick={onToggleSearch}
        >
          Search
        </button>

        <button
          type="button"
          className="controls__btn controls__btn--secondary"
          aria-pressed={showAddForm}
          onClick={onToggleAdd}
        >
          {showAddForm ? 'Close' : 'Add weatherstation'}
        </button>
      </div>

      <div
        className={`controls__folddown ${showSearch || showAddForm ? 'controls__folddown--open' : ''}`}
        aria-hidden={!(showSearch || showAddForm)}
      >
        <div className="controls__folddown-inner">
          {showSearch && (
            <div className="controls__row">
              <label className="visually-hidden" htmlFor="search-input">Search stations</label>
              <input
                id="search-input"
                className="controls-input"
                type="text"
                placeholder="Search by ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
              <button type="button" className="controls__submit" onClick={handleSearch}>Search</button>
            </div>
          )}

          {showAddForm && (
            <div className="controls__add-form">
              <label className="visually-hidden" htmlFor="add-id">ID</label>
              <input
                id="add-id"
                className="controls-input"
                type="text"
                placeholder="ID"
                value={addForm.id}
                onChange={(e) => setAddForm((f) => ({ ...f, id: e.target.value }))}
              />

              <label className="visually-hidden" htmlFor="add-name">Name</label>
              <input
                id="add-name"
                className="controls-input"
                type="text"
                placeholder="Name"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />

              <div className="controls__coord-row">
                <label className="visually-hidden" htmlFor="add-lat">Latitude</label>
                <input
                  id="add-lat"
                  className="controls-input"
                  type="number"
                  step="any"
                  placeholder="Lat"
                  value={addForm.lat}
                  onChange={(e) => setAddForm((f) => ({ ...f, lat: e.target.value }))}
                />

                <label className="visually-hidden" htmlFor="add-lon">Longitude</label>
                <input
                  id="add-lon"
                  className="controls-input"
                  type="number"
                  step="any"
                  placeholder="Lon"
                  value={addForm.lon}
                  onChange={(e) => setAddForm((f) => ({ ...f, lon: e.target.value }))}
                />
              </div>

              <select
                className="controls-input"
                value={addForm.location}
                onChange={(e) => setAddForm((f) => ({ ...f, location: e.target.value }))}
              >
                <option value="0">Binnen</option>
                <option value="1">Buiten</option>
              </select>

              <div className="controls__add-actions">
                <button type="button" className="controls__btn" onClick={() => { setShowAddForm(false); setSearchError(null); }}>Cancel</button>
                <button type="button" className="controls__btn controls__btn--primary" onClick={addStation}>Add</button>
              </div>
            </div>
          )}

          {searchError && <div className="controls__error" role="alert">{searchError}</div>}
        </div>
      </div>
    </div>
  );
}