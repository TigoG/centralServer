// Simple station-level event bus for sensor updates
// - keeps a listener set per station
// - maintains a small cache of the latest merged sensor snapshot per station
// - on subscribe the latest snapshot is delivered immediately (async) if present
const stationListeners = new Map();
const stationCache = new Map();

/**
 * Subscribe to updates for a specific station.
 * @param {string} stationId
 * @param {(update: Object) => void} cb - called with partial updates, e.g. {temperature: 12.3}
 * @returns {() => void} unsubscribe
 */
export function subscribeToStation(stationId, cb) {
  if (!stationId || typeof cb !== 'function') return () => {};
  const sid = String(stationId);
  let set = stationListeners.get(sid);
  if (!set) {
    set = new Set();
    stationListeners.set(sid, set);
  }
  set.add(cb);

  // immediately deliver the latest cached snapshot if present (async to avoid reentrancy)
  const snapshot = stationCache.get(sid);
  if (snapshot && Object.keys(snapshot).length > 0) {
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(() => {
        try {
          cb(snapshot);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('sensorBus subscriber error', e);
        }
      });
    } else {
      setTimeout(() => {
        try {
          cb(snapshot);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('sensorBus subscriber error', e);
        }
      }, 0);
    }
  }

  return () => {
    set.delete(cb);
    if (set.size === 0) stationListeners.delete(sid);
  };
}

/**
 * Publish a partial sensor update for a station.
 * Merges the update into the internal station cache and notifies subscribers.
 * @param {string} stationId
 * @param {Object} update
 */
export function publishStationUpdate(stationId, update) {
  if (!stationId || !update) return;
  const sid = String(stationId);

  // merge into cache
  const prev = stationCache.get(sid) || {};
  const merged = { ...prev, ...update };
  stationCache.set(sid, merged);

  const set = stationListeners.get(sid);
  if (!set) return;
  set.forEach((cb) => {
    try {
      cb(update);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('sensorBus subscriber error', e);
    }
  });
}

/**
 * Return the latest merged snapshot for a station (may be undefined)
 * @param {string} stationId
 * @returns {Object|undefined}
 */
export function getStationSnapshot(stationId) {
  if (!stationId) return undefined;
  return stationCache.get(String(stationId));
}

// Optional helper to clear all listeners and cache (useful in tests)
export function clearAllStationListeners() {
  stationListeners.clear();
  stationCache.clear();
}