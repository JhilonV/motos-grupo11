import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';

function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de login exitoso
    if (user && pass) {
      onLogin();
      navigate('/select-system');
    } else {
      alert('Por favor, ingresa usuario y contraseña.');
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