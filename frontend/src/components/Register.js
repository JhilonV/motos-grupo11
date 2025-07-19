import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import axios from 'axios';

function Register() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones del frontend
    if (!user || !pass || !confirmPass) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    if (pass !== confirmPass) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    if (pass.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    
    if (user.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres.');
      return;
    }
    
    try {
      // Llamar al backend para registrar
      const API_URL = 'https://motos-grupo11-backend-erhnahesh7hrcdc4.canadacentral-01.azurewebsites.net';
      const response = await axios.post(`${API_URL}/users/register`, {
        username: user,
        password: pass
      });
      
      if (response.data.success) {
        alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.');
      }
    }
  };

  return (
    <div className="App-header card">
      <h2>¡Crea tu cuenta!</h2>
      <p style={{ color: '#ffb300', fontWeight: 'bold', fontSize: '1.1em', marginBottom: 20 }}>
        ¡Únete a la aventura y aprende jugando! 🎉
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Usuario (mínimo 3 caracteres)" 
          value={user} 
          onChange={e => setUser(e.target.value)} 
          style={{ width: 240, marginBottom: 8 }} 
        />
        <input 
          type="password" 
          placeholder="Contraseña (mínimo 4 caracteres)" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          style={{ width: 240, marginBottom: 8 }} 
        />
        <input 
          type="password" 
          placeholder="Confirmar contraseña" 
          value={confirmPass} 
          onChange={e => setConfirmPass(e.target.value)} 
          style={{ width: 240, marginBottom: 12 }} 
        />
        {error && (
          <div style={{ 
            color: '#e53935', 
            backgroundColor: '#ffebee', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            marginBottom: '12px',
            fontSize: '14px',
            textAlign: 'center',
            maxWidth: '240px'
          }}>
            {error}
          </div>
        )}
        <button type="submit" style={{ width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <FaUserPlus /> Crear Cuenta
        </button>
      </form>
      <button onClick={() => navigate('/login')} style={{ background: '#00bfff', color: '#fff', marginTop: 16, width: 180 }}>
        Volver al inicio
      </button>
    </div>
  );
}

export default Register; 