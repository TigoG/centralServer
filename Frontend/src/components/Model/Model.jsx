import React from 'react';
import './Model.css'; // make sure this matches your CSS file name

export default function Model({
  show,
  setShow,
  setShowAddForm,
  addForm,
  setAddForm,
  addStation,
  searchError,
  setSearchError,
}) {
  if (!show) return null;

  const closeModal = () => {
    setShow(false);
    setShowAddForm(false);
    setSearchError(null);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Weather Station</h2>

        <div className="modal-form">

          {/* ID + Name */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="modal-add-id" className="input-label">Station ID</label>
              <input
                id="modal-add-id"
                className="controls-input"
                type="text"
                placeholder="Student Number"
                value={addForm.id}
                onChange={(e) => setAddForm((f) => ({ ...f, id: e.target.value }))}
              />
            </div>

            <div className="input-group">
              <label htmlFor="modal-add-name" className="input-label">Name</label>
              <input
                id="modal-add-name"
                className="controls-input"
                type="text"
                placeholder="Example: Garden John"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>

          {/* Latitude + Longitude */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="modal-add-lat" className="input-label">📍 Latitude (Lat)</label>
              <input
                id="modal-add-lat"
                className="controls-input"
                type="number"
                step="any"
                placeholder="Example: 52.3702"
                value={addForm.lat}
                onChange={(e) => setAddForm((f) => ({ ...f, lat: e.target.value }))}
              />
            </div>

            <div className="input-group">
              <label htmlFor="modal-add-lon" className="input-label">📍 Longitude (Lon)</label>
              <input
                id="modal-add-lon"
                className="controls-input"
                type="number"
                step="any"
                placeholder="Example: 4.8952"
                value={addForm.lon}
                onChange={(e) => setAddForm((f) => ({ ...f, lon: e.target.value }))}
              />
            </div>
          </div>

          {/* Location dropdown */}
          <div className="input-group" style={{ marginBottom: '8px' }}>
            <label htmlFor="modal-add-location" className="input-label">Location</label>
            <select
              id="modal-add-location"
              className="controls-input"
              value={addForm.location}
              onChange={(e) => setAddForm((f) => ({ ...f, location: e.target.value }))}
            >
              <option value="0">Inside</option>
              <option value="1">Outside</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {searchError && <div className="form-error" role="alert">{searchError}</div>}

        {/* Actions */}
        <div className="modal-actions">
          <button type="button" className="controls__btn" onClick={closeModal}>Cancel</button>
          <button type="button" className="controls__btn controls__btn--primary" onClick={addStation}>Add</button>
        </div>
      </div>
    </div>
  );
}
