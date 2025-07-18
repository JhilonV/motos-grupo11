import React from 'react';
import { useNavigate } from 'react-router-dom';
import giankarLogo from '../assets/giankar.png.PNG';
import peruLogo from '../assets/peru_bcgl.png.PNG';
import { FaMotorcycle } from 'react-icons/fa';

function SystemSelect() {
  const navigate = useNavigate();

  const handleSelect = (sistema) => {
    localStorage.setItem('sistema', sistema);
    navigate('/buscar');
  };

  const handleLogout = () => {
    localStorage.removeItem('sistema');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="App-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <button onClick={handleBack} style={{ margin: 10 }}>Atrás</button>
        <button onClick={handleLogout} style={{ margin: 10 }}>Cerrar sesión</button>
      </div>
      <h2>¡Elige el sistema que quieres explorar!</h2>
      <p style={{ fontSize: '1.2em', color: '#ffb300', marginBottom: 24 }}>Haz clic en una tarjeta para continuar 🏍️🛵</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        <div className="sistema-card" onClick={() => handleSelect('giankar')}>
          <img src={giankarLogo} alt="Giankar" style={{ width: 120, height: 'auto', borderRadius: 16, border: '3px solid #00bfff', background: '#fff', marginBottom: 12 }} />
          <FaMotorcycle size={40} color="#00bfff" style={{ marginBottom: 8 }} />
          <p style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#00bfff' }}>E. Giankar</p>
        </div>
        <div className="sistema-card" onClick={() => handleSelect('peru_bcgl')}>
          <img src={peruLogo} alt="Peru BCGL" style={{ width: 120, height: 'auto', borderRadius: 16, border: '3px solid #00bfff', background: '#fff', marginBottom: 12 }} />
          <FaMotorcycle size={40} color="#ffb300" style={{ marginBottom: 8 }} />
          <p style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#ffb300' }}>E. Peru BCGL</p>
        </div>
      </div>
    </div>
  );
}

export default SystemSelect; 