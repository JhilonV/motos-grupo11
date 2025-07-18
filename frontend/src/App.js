import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import SystemSelect from './components/SystemSelect';
import Buscar from './components/Buscar';
import { FaSun, FaMoon } from 'react-icons/fa';

function App() {
  // Simulación de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <div className={`background-animado ${theme}`}>
        <span className="motito" style={{ animationDelay: '0s' }} role="img" aria-label="motito">🏍️</span>
        <span className="motito" style={{ animationDelay: '4s', top: '30vh', fontSize: '2.5em' }} role="img" aria-label="motito">🏍️</span>
        <span className="motito" style={{ animationDelay: '8s', top: '50vh', fontSize: '1.8em' }} role="img" aria-label="motito">🏍️</span>
        <span className="llanta" style={{ animationDelay: '0s' }} role="img" aria-label="llanta">🛞</span>
        <span className="llanta" style={{ animationDelay: '5s', top: '80vh', fontSize: '2.5em' }} role="img" aria-label="llanta">🛞</span>
        <span className="llanta" style={{ animationDelay: '2s', top: '60vh', fontSize: '1.7em' }} role="img" aria-label="llanta">🛞</span>
      </div>
      <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}>
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>
      <div className="main-center">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={() => { setIsAuthenticated(true); localStorage.setItem('isAuthenticated', 'true'); }} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/select-system" element={
            isAuthenticated ? <SystemSelect /> : <Navigate to="/login" />
          } />
          <Route path="/buscar" element={
            isAuthenticated ? <Buscar /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
