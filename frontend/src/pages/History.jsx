import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/History.css";

export default function History() {
  // switch log into state so we can clear it
  const [log, setLog] = useState([
    {
      id: "1",
      url: "https://www.tiktok.com/@zaereacts/video/7527108736469486878?is_from_webapp=1&sender_device=pc&web_id=7333353117196781087",
      date: 1753848000000,
    },
    {
      id: "2",
      url: "https://www.tiktok.com/@democrats/video/7260579037397912878?is_from_webapp=1&sender_device=pc&web_id=7333353117196781087",
      date: 1753833600000,
    }
  ]);

  // clear all history entries
  const handleClear = () => {
    setLog([]);
  };

  return (
    // history page
    <div className="history">
      {/* header */}
      <header>
        <h2>Search History</h2>
        <button
          className="btn-clear"
          onClick={handleClear}
          disabled={log.length === 0}
        >
          clear
        </button>
      </header>

      {/* search list */}
      {log.length === 0 ? (
        <p className="empty">Nothing here yet.</p>
      ) : (
        <ul className="list">
          {log.map(({ id, url, date }) => (
            <li key={id} className="item">
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
              <time>{new Date(date).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      )}

      {/* back button */}
      <Link to="/" className="back">
        ← back
      </Link>
    </div>
  );
}
