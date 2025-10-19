import React from 'react';
import './App.css';
import WeatherMap from './components/WeatherMap.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>centralServer — Weather Stations</h1>
      </header>
      <main className="map-wrap">
        <WeatherMap />
      </main>
    </div>
  );
}
