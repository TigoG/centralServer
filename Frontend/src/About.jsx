import React, { useState, useEffect } from "react";
import "./About.css";
import image1 from "./assets/test_deisgn-1.png";
import image2 from "./assets/test_design-2.png";
import image3 from "./assets/weerstation1.png";
function About() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [image1, image2, image3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="dashboard-container"
      style={{
        display: "flex",
        gap: "50px",
        alignItems: "flex-start",
        paddingRight: "50px",
      }}
    >
      <div className="about-page" style={{ flex: 1 }}>
        <h2>Welcome to Homestation Dashboard</h2>
        <p>
          Welcome to your weather station dashboard! Here you can easily monitor
          and control all your connected weather stations in real-time.
          <br />
          <br />
          Explore live weather data collected by your own station or discover
          readings from other users' stations across our network. Each station
          contributes to a collaborative ecosystem of hyperlocal weather
          monitoring.
          <br />
          <br />
          These innovative weather stations were developed collaboratively
          during our Minor Smart Things project an interdisciplinary program
          where we partnered with a talented group of students to design and
          build connected devices that make everyday life smarter and more
          efficient. Together, we transformed ideas into working prototypes that
          demonstrate the power of IoT technology.
          <br />
          <br />
          Click the button below to learn more about the Minor Smart Things
          program.
        </p>
        <a
          href="https://www.hogeschoolrotterdam.nl/samenwerking/samenwerkingsportfolio/Smart_Things/"
          target="_blank"
        >
          <button className="btn_about">Meer informatie: Smart Things</button>
        </a>
        <h3>Check the dashboard and be prepared for the weather!</h3>
        <a href="/">
          <button className="btn_about">Weather Stations</button>
        </a>
      </div>
      <div className="slideshow" style={{ flex: 1, maxWidth: "400px" }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className={`slideshow-image ${
              index === currentImageIndex ? "active" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default About;
