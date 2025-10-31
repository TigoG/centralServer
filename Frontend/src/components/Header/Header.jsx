import React from 'react';
import './Header.css';
import hroLogo from '../../assets/hro-logo.svg';

export default function Header({ title = 'CentralServer', subtitle = 'Weather Stations Dashboard' }) {
  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <div className="header__brand">
          <h1 className="header__title">{title}</h1>
          <p className="header__subtitle">{subtitle}</p>
        </div>
        <div className="header__logo">
          <img src={hroLogo} alt="Hogeschool Rotterdam logo" />
        </div>
      </div>
    </header>
  );
}