import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Entrada from './pages/Entrada';
import Dados from './components/Dados/Dados';
import Roleta from './components/Roleta/Roleta';
import BlackjackGame from './components/Blackjack/Blackjack';

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sendLog } from "./logService";
import { getDeviceType } from "./deviceType";

const AppLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const logData = {
      path: location.pathname,
      timestamp: new Date().toISOString(),
      deviceType: getDeviceType(),
    };

    sendLog(logData);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <main>
          <AppLogger />
          <Routes>
            <Route path="/" element={<Entrada />} />
            <Route path="/dado" element={<Dados />} />
            <Route path="/roleta" element={<Roleta />} />
            <Route path="/blackjack" element={<BlackjackGame />} />
          </Routes>
          <footer>
            <p>
              Desenvolvido por <a href="https://github.com/TomG07" target="_blank" rel="noopener noreferrer">Tomás Frazão</a>
            </p>
          </footer>

        </main>
      </div>
    </Router>
  );
}

export default App;
