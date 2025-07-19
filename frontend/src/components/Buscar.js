import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSignOutAlt, FaSave, FaTrash, FaSearch } from 'react-icons/fa';

function Buscar() {
  const [resultados, setResultados] = useState([]);
  const [sistema] = useState(localStorage.getItem('sistema'));
  const [error, setError] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [descCargada, setDescCargada] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState({}); // {rowIdx: {campo: valor}}
  const navigate = useNavigate();
  const API_URL = 'https://motos-grupo11-backend-erhnahesh7hrcdc4.canadacentral-01.azurewebsites.net';

  useEffect(() => {
    setDescCargada(false);
  }, [busqueda, sistema]);

  // Función para cargar descripción
  const cargarDescripcion = async (dni) => {
    if (dni) {
      try {
        const res = await axios.get(`${API_URL}/descripcion/${sistema}/${dni}`);
        setDescripcion(res.data.descripcion || '');
      } catch (err) {
        setDescripcion('');
      }
    } else {
      setDescripcion('');
    }
  };

  useEffect(() => {
    if (resultados.length > 0) {
      // Cargar descripción del primer resultado
      const dni = resultados[0].DNI;
      cargarDescripcion(dni);
    } else {
      setDescripcion('');
    }
  }, [resultados, sistema, API_URL]);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError('');
    setResultados([]);
    if (!busqueda) {
      setError('Ingresa un dato para buscar.');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/data/${sistema}/buscar/${encodeURIComponent(busqueda)}`);
      if (res.data.length === 0) setError('No se encontraron resultados.');
      setResultados(res.data);
    } catch (err) {
      setError('Error al buscar.');
    }
  };

  const handleEdit = (rowIdx, campo, valor) => {
    setEditando(prev => ({
      ...prev,
      [rowIdx]: { ...prev[rowIdx], [campo]: valor }
    }));
  };

  const handleGuardarEdit = async (row, rowIdx) => {
    const cambios = editando[rowIdx];
    if (!cambios) return;
    let dniOriginal = row.DNI;
    // Si el DNI fue editado, primero actualizar el DNI
    if (cambios.DNI && cambios.DNI !== row.DNI) {
      await axios.post(`${API_URL}/data/${sistema}/editar/${dniOriginal}`, { campo: 'DNI', valor: cambios.DNI });
      dniOriginal = cambios.DNI;
    }
    for (const campo in cambios) {
      if (campo === 'DNI') continue;
      await axios.post(`${API_URL}/data/${sistema}/editar/${dniOriginal}`, { campo, valor: cambios[campo] });
    }
    setEditando(prev => ({ ...prev, [rowIdx]: {} }));
    // Refrescar resultados
    const res = await axios.get(`${API_URL}/data/${sistema}/buscar/${encodeURIComponent(busqueda)}`);
    setResultados(res.data);
  };

  const handleGuardarDesc = async () => {
    if (!resultados[0]?.DNI) {
      alert('No hay cliente seleccionado para guardar descripción.');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/descripcion/${sistema}/${resultados[0].DNI}`, { descripcion });
      alert('✅ Descripción guardada exitosamente');
    } catch (err) {
      alert('❌ Error al guardar la descripción');
    }
  };

  const handleBorrarDesc = async () => {
    if (!resultados[0]?.DNI) {
      alert('No hay cliente seleccionado para borrar descripción.');
      return;
    }
    
    if (!descripcion.trim()) {
      alert('No hay descripción para borrar.');
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/descripcion/${sistema}/${resultados[0].DNI}`);
      setDescripcion('');
      alert('✅ Descripción borrada exitosamente');
    } catch (err) {
      alert('❌ Error al borrar la descripción');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sistema');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };
  const handleBack = () => {
    navigate('/select-system');
  };

  return (
    <div className="App-header card">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <button onClick={handleBack} style={{ margin: 10, display: 'flex', alignItems: 'center', gap: 6 }}><FaArrowLeft /> Atrás</button>
        <button onClick={handleLogout} style={{ margin: 10, display: 'flex', alignItems: 'center', gap: 6 }}><FaSignOutAlt /> Cerrar sesión</button>
      </div>
      <h2>Busca por dato del cliente</h2>
      <form onSubmit={handleBuscar} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
        <input type="text" placeholder="Buscar por cualquier dato..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ width: 220 }} />
        <button type="submit" style={{ width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <FaSearch /> Buscar
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {resultados.length > 0 && (
        <div style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center',
          overflowX: 'auto'
        }}>
          <table className="table" style={{
            minWidth: '95%',
            maxWidth: '1200px',
            borderCollapse: 'collapse',
            margin: '0 auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#00bfff', color: 'white' }}>
                {Object.keys(resultados[0]).map((key, i) => (
                  <th key={i} style={{ 
                    padding: '12px 8px', 
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: '1px solid #0099cc',
                    minWidth: '120px'
                  }}>{key}</th>
                ))}
                <th style={{ 
                  padding: '12px 8px', 
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '1px solid #0099cc',
                  minWidth: '100px'
                }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((row, idx) => (
                <tr key={idx} style={{ 
                  background: idx % 2 === 0 ? '#f8f9fa' : '#ffffff',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  {Object.entries(row).map(([key, val], i) => (
                    <td key={i} style={{ 
                      textAlign: 'center', 
                      fontWeight: key === 'DNI' ? 'bold' : 'normal', 
                      color: key === 'DNI' ? '#ffb300' : undefined, 
                      fontSize: key === 'DNI' ? '1.1em' : '14px',
                      padding: '8px 4px',
                      border: '1px solid #dee2e6',
                      verticalAlign: 'middle'
                    }}>
                      <input
                        type="text"
                        value={editando[idx]?.[key] !== undefined ? editando[idx][key] : val || ''}
                        onChange={e => handleEdit(idx, key, e.target.value)}
                        style={{ 
                          width: '95%', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px', 
                          padding: '6px 8px', 
                          background: 'transparent', 
                          textAlign: 'center',
                          fontSize: '13px',
                          minHeight: '32px'
                        }}
                      />
                    </td>
                  ))}
                  <td style={{ 
                    textAlign: 'center',
                    padding: '8px 4px',
                    border: '1px solid #dee2e6',
                    verticalAlign: 'middle'
                  }}>
                    <button onClick={() => handleGuardarEdit(row, idx)} style={{ 
                      background: '#4caf50', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }} title="Guardar cambios">
                      <FaSave /> Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold', color: '#00bfff' }}>Descripción:</label>
              {resultados[0]?.DNI && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  backgroundColor: '#f0f0f0', 
                  padding: '2px 8px', 
                  borderRadius: '12px' 
                }}>
                  Cliente: {resultados[0].DNI}
                </span>
              )}
            </div>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={3}
              style={{ width: '100%', borderRadius: 12, padding: 10, fontSize: '1em', marginTop: 8 }}
              placeholder="Agrega una descripción didáctica..."
            />
            <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={handleGuardarDesc} style={{ background: '#4caf50', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }} type="button">
                <FaSave /> Guardar
              </button>
              <button onClick={handleBorrarDesc} style={{ background: '#e53935', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }} type="button">
                <FaTrash /> Borrar
              </button>
              {descripcion && (
                <span style={{ fontSize: '12px', color: '#4caf50' }}>
                  💾 Descripción lista para guardar
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buscar;