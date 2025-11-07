import React from "react";
import "./WeatherCard.css";

export default function WeatherCard({ station = {}, onFocus = () => {} }) {
  const { id = "unknown", student_number = "Unknown", sensors = {} } = station;
  const tempVal = sensors.temperature;
  const temp =
    typeof tempVal === "number" && tempVal !== -1
      ? `${tempVal.toFixed(1)} °C`
      : "—";

  const getWeatherInfo = (temp) => {
    if (typeof temp !== "number" || temp === -1) {
      return { icon: "❓", description: "No data" };
    }
    if (temp >= 21) {
      return { icon: "☀️", description: "Sunny" };
    }
    if (temp >= 16) {
      return { icon: "⛅", description: "Partly cloudy" };
    }
    if (temp >= 10) {
      return { icon: "☁️", description: "Cool" };
    }
    return { icon: "❄️", description: "Cold" };
  };

  const { icon, description } = getWeatherInfo(tempVal);

  return (
    <article
      className="weather-card"
      role="article"
      aria-labelledby={`wc-${id}-title`}
    >
      <div className="weather-card__left">
        <div className="weather-card__icon" aria-hidden="true">
          {icon}
        </div>
      </div>

      <div className="weather-card__body">
        <h3 id={`wc-${id}-title`} className="weather-card__city">
          {student_number}
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
            aria-label={`Focus ${student_number} on map`}
          >
            Focus
          </button>
        </div>
      </div>
    </article>
  );
}
