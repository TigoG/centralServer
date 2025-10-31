import React from "react";
import "./Controls.css";

export default function Controls({
  showAddForm,
  setShowAddForm,
  showAddModal = false,
  searchQuery,
  setSearchQuery,
  searchError,
  setSearchError,
  addForm,
  setAddForm,
  addStation,
}) {
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
      </div>

      <div
        className={`controls__folddown ${showSearch || (showAddForm && !showAddModal) ? 'controls__folddown--open' : ''}`}
        aria-hidden={!(showSearch || (showAddForm && !showAddModal))}
      >
        <div className="controls__folddown-inner">
          {/* search moved to Layout; only add-form remains here */}

          {showAddForm && !showAddModal && (
            <div className="controls__add-form">
              <div style={{ display: 'flex', gap: '8px' }}>
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
              </div>
 
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '8px' }}>
                  <span style={{ fontSize: '0.9em', marginBottom: '2px' }}>Breedtegraad:</span>
                  <label className="visually-hidden" htmlFor="add-lat">Breedtegraad</label>
                  <input
                    id="add-lat"
                    className="controls-input"
                    type="number"
                    step="any"
                    placeholder="Lat"
                    value={addForm.lat}
                    onChange={(e) => setAddForm((f) => ({ ...f, lat: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9em', marginBottom: '2px' }}>Lengtegraad:</span>
                  <label className="visually-hidden" htmlFor="add-lon">Lengtegraad</label>
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
              </div>
 
              <select
                className="controls-input"
                value={addForm.location}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, location: e.target.value }))
                }
              >
                <option value="0">Binnen</option>
                <option value="1">Buiten</option>
              </select>
 
              <div className="controls__add-actions">
                <button
                  type="button"
                  className="controls__btn"
                  onClick={() => {
                    setShowAddForm(false);
                    setSearchError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="controls__btn controls__btn--primary"
                  onClick={addStation}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {searchError && (
            <div className="controls__error" role="alert">
              {searchError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
