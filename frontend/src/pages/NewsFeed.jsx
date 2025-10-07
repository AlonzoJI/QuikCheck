import { useState } from "react";
import NewsCard from "../components/NewsCard";
import "../styles/NewsFeed.css";

// temporary sample data
const testArticles = [
  {
    source: "Reuters",
    headline: "Breakthrough Quantum Computing Chip Announced",
    briefSummary: "New quantum chip boosts computing power.",
    standardSummary:
      "A leading tech company unveiled a revolutionary quantum computing chip that significantly enhances processing speeds.",
    detailedSummary:
      "The latest quantum computing chip introduced by the company promises unprecedented processing power, enabling advances in cryptography, AI, and data analysis. Industry experts see this as a milestone for the future of computing.",
    category: "Technology",
  },
  {
    source: "TechCrunch",
    headline: "AI-Powered Virtual Reality Platform Gains Popularity",
    briefSummary: "New VR platform uses AI for immersive experiences.",
    standardSummary:
      "The newest AI-driven virtual reality platform has rapidly gained popularity among consumers and professionals alike for creating immersive, interactive environments.",
    detailedSummary:
      "This AI-powered VR platform combines cutting-edge machine learning with real-time user interaction to deliver personalized and adaptive virtual experiences. It is transforming gaming, online collaboration, and training simulations.",
    category: "Technology",
  },
  {
    source: "Financial Times",
    headline: "Global Markets Surge Amid Optimistic Economic Outlook",
    briefSummary: "Markets up as economic outlook improves.",
    standardSummary:
      "Global financial markets rallied strongly today in response to positive economic forecasts and robust earnings reports.",
    detailedSummary:
      "Investors worldwide reacted to improved economic forecasts characterized by steady GDP growth, low inflation levels, and strong corporate earnings, leading to heightened market confidence and increased trading volumes.",
    category: "Business",
  },
];


export default function NewsFeed() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState("");

  //left button click
  const goToPrevious = () => {
    if (isAnimating) return; 
    setIsAnimating(true);
    setAnimationDirection("slide-right");
    setTimeout(() => {
      setCurrentCardIndex((prev) =>
        prev === 0 ? testArticles.length - 1 : prev - 1
      ); // updates index to decrease by 1
      setAnimationDirection("slide-in-left"); // previous card slide in from left
      setTimeout(() => {
        setIsAnimating(false); // end animation
        setAnimationDirection("");}
        , 250);
      }, 300); 
  };

  //right button click
  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimationDirection("slide-left");
    setTimeout(() => {
      setCurrentCardIndex((prev) =>
        prev === testArticles.length - 1 ? 0 : prev + 1
      );// updates index to decrease by 1
      setAnimationDirection("slide-in-right"); // next card slide in from right
      setTimeout(() => {
        setIsAnimating(false); // end animation
        setAnimationDirection("");
      }, 250);
    }, 300);
  };

  // news feed setup 
  return (
    <main className="news-feed">
      <h1>Your News Feed</h1>
      <div className="news-card-container">
        <NewsCard
          article={testArticles[currentCardIndex]}
          animationClass={animationDirection}
        />
        <div className="swipe-buttons">
          <button
            className="swipe-btn swipe-btn-left"
            onClick={goToPrevious}
            disabled={isAnimating}
          >
            ←
          </button>
          <button
            className="swipe-btn swipe-btn-right"
            onClick={goToNext}
            disabled={isAnimating}
          >
            →
          </button>
        </div>
      </div>
    </main>
  );
}
