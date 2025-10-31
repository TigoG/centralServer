import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <h2>Welcome to Homestation Dashboard</h2>
      <p>
      Welcome to your weather station dashboard! Here you can easily monitor and control all your connected weather stations in real-time.
      <br /><br />
      Explore live weather data collected by your own station or discover readings from other users' stations across our network. Each station contributes to a collaborative ecosystem of hyperlocal weather monitoring.
      <br /><br />
      These innovative weather stations were developed collaboratively during our Minor Smart Things project—an interdisciplinary program where we partnered with a talented group of students to design and build connected devices that make everyday life smarter and more efficient. Together, we transformed ideas into working prototypes that demonstrate the power of IoT technology and community-driven data collection.
      <br /><br />
      Click the button below to learn more about the Minor Smart Things program and discover the journey of how these weather stations came to life from initial concept to deployed devices.
      </p>
      <a  href="https://www.hogeschoolrotterdam.nl/samenwerking/samenwerkingsportfolio/Smart_Things/" target="_blank">
        <button class="btn_about">Meer informatie: Smart Things</button>
      </a>
      <h3>Check the dashboard and be prepared for the weather!</h3>
      <a href="/">
        <button class="btn_about">Weather staions</button>
      </a>
    </div>
  );
}

export default About;
