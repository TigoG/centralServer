import React from "react";
import "./WeatherCard.css";

export default function WeatherCard({ station = {}, onFocus = () => {} }) {
  const { id = "unknown", name = "Unknown", sensors = {} } = station;
  const tempVal = sensors.temperature;
  const temp =
    typeof tempVal === "number" && tempVal !== -1
      ? `${tempVal.toFixed(1)} °C`
      : "—";
  const description = (() => {
    if (typeof tempVal !== "number" || tempVal === -1) return "No data";
    if (tempVal >= 25) return "Sunny";
    if (tempVal >= 18) return "Partly cloudy";
    return "Cool";
  })();

  return (
    <article
      className="weather-card"
      role="article"
      aria-labelledby={`wc-${id}-title`}
    >
      <div className="weather-card__left">
        <div className="weather-card__icon" aria-hidden="true">
          ☁️
        </div>
      </div>

      <div className="weather-card__body">
        <h3 id={`wc-${id}-title`} className="weather-card__city">
          {name}
        </h3>
        <div className="weather-card__date">
          {new Date().toLocaleDateString()}
        </div>
        <div className="weather-card__desc">{description}</div>
      </div>

      <div className="weather-card__right">
        <div className="weather-card__temp">{temp}</div>
        <div className="weather-card__buttons">
          <button className="weather-card__btn">Actuator</button>
          <button
            type="button"
            className="weather-card__btn"
            onClick={onFocus}
            aria-label={`Focus ${name} on map`}
          >
            Focus
          </button>
        </div>
      </div>
    </article>
  );
}
