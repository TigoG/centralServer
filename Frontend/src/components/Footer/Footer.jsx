import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <small className="footer__credit">Built for demo — CentralServer • © {new Date().getFullYear()}</small>
      </div>
    </footer>
  );
}