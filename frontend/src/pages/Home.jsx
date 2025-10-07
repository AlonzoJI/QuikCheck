import React, { useState, useEffect } from 'react';
import "../styles/Home.css";
import TikTokChecker from "../components/tiktokChecker";
import {Link} from "react-router-dom";

const Home = () => {
  const [scrollOpacity, setScrollOpacity] = useState(1);
  // fade + scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = 420; // halfway point
      
      const opacity = Math.max(0, 1 - (scrollTop / maxScroll));
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* landing / home section */}
      <div 
        className="homepage"
        style={{ 
          opacity: scrollOpacity,
          transition: 'opacity 0.1s ease-out' 
        }}
      >
        {/* left section */}
        <div className="left-section">
          <h1>Truth in Every <span className="swipe-text">Swipe</span></h1>
          <p>Combat misinformation with our AI-powered fact-checking tool and quick news summaries</p>
          
          {/* button section */}
          <div className="buttons">
            {/* tt checker button */}
            <div className="button-wrapper">
                {/* js func to drop down to tt checker */}
                <button className="tiktok-button"
                
                onClick={() =>
                    document
                        .getElementById("tiktok-checker")
                        .scrollIntoView({behavior: "smooth"})
                    }> Check TikTok Video
                </button>
            </div>

            {/* news button */}
            <div className="button-wrapper">
              <Link to="/news"><button className="news-button">Browse News</button></Link>
            </div>
          </div>
        </div>

        {/* right section */}
        <div className="right-section">
            {/* card abt fact checker */}
            <div className="home-card">
                {/* background blur */}
                <div className="home-card-inner">
                    {/* card header */}
                    <div className="card-header">
                        <span className="dropdown-name">Checker</span>
                        <span className="dropdown-icon">▼</span>
                    </div>
                    {/* card icon and text */}
                    <img src="/pics/fact-check.png" className="home-card-icon"/>
                    <h3>TikTok Fact Checker</h3>
                    <p>Paste any TikTok link and our AI will cross-check the videos claims
                    against trusted sources, letting you know whats verified and not.</p>
                </div>
            </div>
            
            {/* card abt news */}
            <div className="home-card">
                {/* background blur */}
                <div className="home-card-inner">
                    {/* card header */}
                    <div className="card-header">
                        <span className="dropdown-name">News</span>
                        <span className="dropdown-icon">▼</span>
                    </div>
                    {/* card icon and text */}
                    <img src="/pics/news.png" className="home-card-icon"/>
                    <h3>Fact Based News</h3>
                    <p>Swipe through verified news cards that give you a 
                    trustworthy briefing on today's stories.</p>
                </div>
             </div>

        </div>
      </div>

      {/* tt checker section */}
      <TikTokChecker/>
    </div>
  );
};

export default Home;