import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MeshGradientBackground from "./components/gradientBackground";
import TableOfContents from "./components/tableOfContents";
import HomePage from "./pages/Home";
import NewsFeed from "./pages/NewsFeed";
import HistoryPage from "./pages/History";

function App() {
  return (
    <Router>
      {/* background n navbar */}
      <MeshGradientBackground />
      <TableOfContents />

      {/* routes */}
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/news" element={<NewsFeed />}/>
        <Route path="/history" element={<HistoryPage />}/>
      </Routes>
    </Router>
  );
}

export default App;
