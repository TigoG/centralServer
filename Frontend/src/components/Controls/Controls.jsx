import React from "react";
import "./Controls.css";

export default function Controls({
  showAddForm,
  setShowAddForm,
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
        {/* Search is always visible; no toggle button */}
        <button
          type="button"
          className="controls__btn controls__btn--secondary"
          aria-pressed={showAddForm}
          onClick={onToggleAdd}
        >
          {showAddForm ? "Close" : "Add weatherstation"}
        </button>
      </div>

      <div
        className={`controls__folddown ${
          /* always show search; add form still toggles */
          true || showAddForm ? "controls__folddown--open" : ""
        }`}
        aria-hidden={false}
      >
        <div className="controls__folddown-inner">
          {/* search moved to Layout; only add-form remains here */}

          {showAddForm && (
            <div className="controls__add-form">
              <label className="visually-hidden" htmlFor="add-id">
                ID
              </label>
              <input
                id="add-id"
                className="controls-input"
                type="text"
                placeholder="ID"
                value={addForm.id}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, id: e.target.value }))
                }
              />

              <label className="visually-hidden" htmlFor="add-name">
                Name
              </label>
              <input
                id="add-name"
                className="controls-input"
                type="text"
                placeholder="Name"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, name: e.target.value }))
                }
              />

              <div className="controls__coord-row">
                <label className="visually-hidden" htmlFor="add-lat">
                  Latitude
                </label>
                <input
                  id="add-lat"
                  className="controls-input"
                  type="number"
                  step="any"
                  placeholder="Lat"
                  value={addForm.lat}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, lat: e.target.value }))
                  }
                />

                <label className="visually-hidden" htmlFor="add-lon">
                  Longitude
                </label>
                <input
                  id="add-lon"
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

          {/* search errors are shown under the SearchBar in Layout */}
        </div>
      </div>
    </div>
  );
}
