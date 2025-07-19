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

  useEffect(() => {
    if (resultados.length > 0 && !descCargada) {
      // Buscar descripción solo si el primer resultado tiene DNI válido
      const dni = resultados[0].DNI;
      if (dni) {
        axios.get(`${API_URL}/descripcion/${sistema}/${dni}`)
          .then(res => setDescripcion(res.data.descripcion || ''))
          .catch(() => setDescripcion(''));
      } else {
        setDescripcion('');
      }
      setDescCargada(true);
    }
  }, [resultados, sistema, descCargada, API_URL]);

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
    await axios.post(`${API_URL}/descripcion/${sistema}/${resultados[0]?.DNI}`, { descripcion });
    alert('Descripción guardada');
  };

  const handleBorrarDesc = async () => {
    await axios.delete(`${API_URL}/descripcion/${sistema}/${resultados[0]?.DNI}`);
    setDescripcion('');
    alert('Descripción borrada');
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
        <div style={{ width: '100%' }}>
          <table className="table">
            <thead>
              <tr>
                {Object.keys(resultados[0]).map((key, i) => (
                  <th key={i}>{key}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#f5faff' : '#fff' }}>
                  {Object.entries(row).map(([key, val], i) => (
                    <td key={i} style={{ textAlign: 'center', fontWeight: key === 'DNI' ? 'bold' : 'normal', color: key === 'DNI' ? '#ffb300' : undefined, fontSize: key === 'DNI' ? '1.1em' : undefined }}>
                      <input
                        type="text"
                        value={editando[idx]?.[key] !== undefined ? editando[idx][key] : val || ''}
                        onChange={e => handleEdit(idx, key, e.target.value)}
                        style={{ width: '90%', border: '1px solid #ccc', borderRadius: 6, padding: 4, background: 'transparent', textAlign: 'center' }}
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => handleGuardarEdit(row, idx)} style={{ background: '#4caf50', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }} title="Guardar cambios">
                      <FaSave /> Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <label style={{ fontWeight: 'bold', color: '#00bfff' }}>Descripción:</label><br />
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={3}
            style={{ width: '100%', borderRadius: 12, padding: 10, fontSize: '1em', marginTop: 8 }}
            placeholder="Agrega una descripción didáctica..."
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button onClick={handleGuardarDesc} style={{ background: '#4caf50', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }} type="button">
              <FaSave /> Guardar
            </button>
            <button onClick={handleBorrarDesc} style={{ background: '#e53935', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }} type="button">
              <FaTrash /> Borrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buscar;