//import React from "react";
import React, { useState, useEffect } from "react";
import {Link} from "react-router-dom";
import "../styles/tableOfContents.css";

// navbar
const TableOfContents = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  // navbar blur 
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className= {`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="left-nav">

        {/* web name */}
        <Link to="/" className="home-link">
        <h1>QuikChek</h1>
        {/* tiktok logo */}
        <img src="/pics/tiktok-logo.png" alt="TikTok Logo" className="tiktok-logo"/>
        </Link>
      </div>
      
      {/* nav links */}
      <div className="nav-links">
        <Link to="/" className="nav-link">
          <span className="nav-icon-wrapper">
            <img src="/pics/home.png" alt="Home icon" className="nav-icon"/>
          </span>
          <span className="link-name">HOME</span>
        </Link>
        
        <Link to="/news" className="nav-link">
          <span className="nav-icon-wrapper">
            <img src="/pics/news2.png" alt="News icon" className="nav-icon"/>
          </span>
          <span className="link-name">NEWS</span>
        </Link>

      <Link to="/history" className="nav-link">
        <span className="nav-icon-wrapper">
          <img src="/pics/bookmark.png" alt="Saved icon" className="nav-icon"/>
        </span>
        <span className="link-name">HISTORY</span>
      </Link>
    </div>
  </nav>
  );
};

export default TableOfContents;
