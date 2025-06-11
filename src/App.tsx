import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Entrada from './pages/Entrada';
import Dados from './components/Dados/Dados';
import Roleta from './components/Roleta/Roleta';
import BlackjackGame from './components/Blackjack/Blackjack';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <main>
          <Routes>
            <Route path="/" element={<Entrada />} />
            <Route path="/dado" element={<Dados />} />
            <Route path="/roleta" element={<Roleta />} />
            <Route path="/blackjack" element={<BlackjackGame />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
