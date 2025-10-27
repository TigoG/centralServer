import "./Navbar.css";
import React from "react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">centralServer</div>
      <div className="navbar-links">
        <a className="navbar-link" href="#map">
          Map
        </a>
        <a className="navbar-link" href="#stations">
          Stations
        </a>
        <a className="navbar-link" href="#about">
          About
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
