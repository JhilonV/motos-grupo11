const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test route
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Get all data from a system
app.get('/data/:sistema', (req, res) => {
  const sistema = req.params.sistema;
  let filePath;
  
  if (sistema === 'giankar') {
    filePath = path.join(__dirname, 'backend/data/giankar.json');
  } else if (sistema === 'peru_bcgl') {
    filePath = path.join(__dirname, 'backend/data/peru_bcgl.json');
  } else {
    return res.status(400).json({ error: 'Sistema no válido' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'No se pudo leer la base de datos' });
    }
    res.json(JSON.parse(data));
  });
});

// Search by DNI
app.get('/data/:sistema/dni/:dni', (req, res) => {
  const sistema = req.params.sistema;
  const dni = req.params.dni;
  let filePath;
  
  if (sistema === 'giankar') {
    filePath = path.join(__dirname, 'backend/data/giankar.json');
  } else if (sistema === 'peru_bcgl') {
    filePath = path.join(__dirname, 'backend/data/peru_bcgl.json');
  } else {
    return res.status(400).json({ error: 'Sistema no válido' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'No se pudo leer la base de datos' });
    }
    const json = JSON.parse(data);
    const registros = Array.isArray(json) ? json : json.Hoja1 || [];
    const encontrados = registros.filter(r => r.Column9 && r.Column9.toString() === dni);
    res.json(encontrados);
  });
});

// Mapeo de columnas genéricas a nombres amigables
const columnMap = {
  Column1: 'ITEM',
  Column2: 'FLOTA',
  Column3: 'PLACA',
  Column4: 'MODELO',
  Column5: 'MARCA',
  Column6: 'COLOR',
  'CHARLAS CARNET VIAL': 'NOMBRES Y APELLIDOS DE CONDUCTORES',
  Column9: 'DNI',
  Column10: 'LIC.COND.',
  TELEFONO: 'TELEFONO'
};

// Search by any field
app.get('/data/:sistema/buscar/:texto', (req, res) => {
  const sistema = req.params.sistema;
  const texto = req.params.texto.toLowerCase();
  let filePath;
  
  if (sistema === 'giankar') {
    filePath = path.join(__dirname, 'backend/data/giankar.json');
  } else if (sistema === 'peru_bcgl') {
    filePath = path.join(__dirname, 'backend/data/peru_bcgl.json');
  } else {
    return res.status(400).json({ error: 'Sistema no válido' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'No se pudo leer la base de datos' });
    }
    const json = JSON.parse(data);
    const registros = Array.isArray(json) ? json : json.Hoja1 || [];
    const resultados = registros.filter(reg =>
      Object.values(reg).some(val =>
        val && val.toString().toLowerCase().includes(texto)
      ) || 
      // Búsqueda específica por DNI (Column9)
      (reg.Column9 && reg.Column9.toString() === texto)
    ).map(reg => {
      // Renombrar las claves y asegurar todos los campos
      const nuevo = {};
      Object.entries(reg).forEach(([k, v]) => {
        nuevo[columnMap[k] || k] = v;
      });
      // Asegurar todos los campos importantes
      if (!nuevo['DNI'] && reg['Column9']) nuevo['DNI'] = reg['Column9'];
      if (!nuevo['LIC.COND.'] && reg['Column10']) nuevo['LIC.COND.'] = reg['Column10'];
      if (!nuevo['TELEFONO']) nuevo['TELEFONO'] = '';
      return nuevo;
    });
    res.json(resultados);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Ping test: http://localhost:${PORT}/ping`);
  console.log(`Giankar data: http://localhost:${PORT}/data/giankar`);
}); 