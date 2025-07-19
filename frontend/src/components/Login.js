import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';

function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Llamar al backend para verificar login
      const API_URL = 'https://motos-grupo11-backend-erhnahesh7hrcdc4.canadacentral-01.azurewebsites.net';
      const response = await axios.post(`${API_URL}/users/login`, {
        username: user,
        password: pass
      });
      
      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', user);
        onLogin();
        navigate('/select-system');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert('Usuario o contraseña incorrectos. Intenta de nuevo.');
      } else {
        alert('Error al iniciar sesión. Intenta de nuevo.');
      }
      setPass(''); // Limpiar contraseña
    }
  };

  return (
    <div className="App-header card">
      <h2>¡Bienvenido a Grupo 11!</h2>
      <p style={{ color: '#00bfff', fontWeight: 'bold', fontSize: '1.1em', marginBottom: 20 }}>
        Ingresa para comenzar tu aventura didáctica 🚀
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input type="text" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} style={{ width: 240 }} /><br/>
        <input type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} style={{ width: 240 }} /><br/>
        <button type="submit" style={{ width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <FaSignInAlt /> Iniciar Sesión
        </button>
      </form>
      <button onClick={() => navigate('/register')} style={{ background: '#ffb300', color: '#23272f', marginTop: 16, width: 180 }}>
        Crear cuenta nueva
      </button>
    </div>
  );
}

export default Login; 