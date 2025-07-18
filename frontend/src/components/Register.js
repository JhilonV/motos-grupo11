import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';

function Register() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de registro
    if (user && pass) {
      alert('Cuenta creada. Ahora puedes iniciar sesión.');
      navigate('/login');
    } else {
      alert('Por favor, completa todos los campos.');
    }
  };

  return (
    <div className="App-header card">
      <h2>¡Crea tu cuenta!</h2>
      <p style={{ color: '#ffb300', fontWeight: 'bold', fontSize: '1.1em', marginBottom: 20 }}>
        ¡Únete a la aventura y aprende jugando! 🎉
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input type="text" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} style={{ width: 240 }} /><br/>
        <input type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} style={{ width: 240 }} /><br/>
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