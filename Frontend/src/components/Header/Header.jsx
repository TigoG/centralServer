import React from "react";
import "./Header.css";

export default function Header({
  title = "centralServer",
  subtitle = "Weather Stations Dashboard",
}) {
  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <div className="header__brand">
          <h1 className="header__title">{title}</h1>
          <p className="header__subtitle">{subtitle}</p>
          <div className="header__links">
            <a href="/" className="header__link">
              Home
            </a>
            <a href="/about" className="header__link">
              About
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
