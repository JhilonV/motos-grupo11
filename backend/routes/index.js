var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/ping', function(req, res, next) {
  res.json({ message: 'pong' });
});

// Obtener todos los datos de un sistema
router.get('/data/:sistema', function(req, res) {
  const sistema = req.params.sistema;
  let filePath;
  if (sistema === 'giankar') filePath = path.join(__dirname, 'data/giankar.json');
  else if (sistema === 'peru_bcgl') filePath = path.join(__dirname, 'data/peru_bcgl.json');
  else return res.status(400).json({ error: 'Sistema no válido' });

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer la base de datos' });
    res.json(JSON.parse(data));
  });
});

// Buscar por DNI en un sistema
router.get('/data/:sistema/dni/:dni', function(req, res) {
  const sistema = req.params.sistema;
  const dni = req.params.dni;
  let filePath;
  if (sistema === 'giankar') filePath = path.join(__dirname, 'data/giankar.json');
  else if (sistema === 'peru_bcgl') filePath = path.join(__dirname, 'data/peru_bcgl.json');
  else return res.status(400).json({ error: 'Sistema no válido' });

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer la base de datos' });
    const json = JSON.parse(data);
    // Adaptar para buscar dentro de "Hoja1" si existe
    const registros = Array.isArray(json) ? json : json.Hoja1 || [];
    const encontrados = registros.filter(r => r.Column9 && r.Column9.toString() === dni);
    res.json(encontrados);
  });
});

// Mapeo de columnas genéricas a nombres amigables (usado en todas las búsquedas)
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

// Buscar por cualquier campo en un sistema
router.get('/data/:sistema/buscar/:texto', function(req, res) {
  const sistema = req.params.sistema;
  const texto = req.params.texto.toLowerCase();
  let filePath;
  if (sistema === 'giankar') filePath = path.join(__dirname, 'data/giankar.json');
  else if (sistema === 'peru_bcgl') filePath = path.join(__dirname, 'data/peru_bcgl.json');
  else return res.status(400).json({ error: 'Sistema no válido' });

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer la base de datos' });
    const json = JSON.parse(data);
    const registros = Array.isArray(json) ? json : json.Hoja1 || [];
    const resultados = registros.filter(reg =>
      Object.values(reg).some(val =>
        val && val.toString().toLowerCase().includes(texto)
      )
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

// Ruta para actualizar un campo de un registro por DNI
router.post('/data/:sistema/editar/:dni', function(req, res) {
  const sistema = req.params.sistema;
  const dni = req.params.dni;
  const { campo, valor } = req.body;
  let filePath;
  if (sistema === 'giankar') filePath = path.join(__dirname, 'data/giankar.json');
  else if (sistema === 'peru_bcgl') filePath = path.join(__dirname, 'data/peru_bcgl.json');
  else return res.status(400).json({ error: 'Sistema no válido' });

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer la base de datos' });
    const json = JSON.parse(data);
    const registros = Array.isArray(json) ? json : json.Hoja1 || [];
    let actualizado = false;
    registros.forEach(reg => {
      if (reg['Column9'] && reg['Column9'].toString() === dni) {
        // Buscar la clave original del campo
        const claveOriginal = Object.keys(columnMap).find(k => columnMap[k] === campo) || campo;
        reg[claveOriginal] = valor;
        actualizado = true;
      }
    });
    // Guardar cambios
    const nuevoJson = Array.isArray(json) ? registros : { ...json, Hoja1: registros };
    fs.writeFile(filePath, JSON.stringify(nuevoJson, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'No se pudo guardar el cambio' });
      res.json({ ok: actualizado });
    });
  });
});

// --- Descripciones persistentes ---
const DESCS_FILE = path.join(__dirname, 'data/descripciones.json');

// Obtener descripción por DNI
router.get('/descripcion/:sistema/:dni', (req, res) => {
  const { sistema, dni } = req.params;
  fs.readFile(DESCS_FILE, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') return res.status(500).json({ error: 'No se pudo leer descripciones' });
    const descripciones = data ? JSON.parse(data) : {};
    res.json({ descripcion: (descripciones[sistema] && descripciones[sistema][dni]) || '' });
  });
});

// Guardar o editar descripción
router.post('/descripcion/:sistema/:dni', (req, res) => {
  const { sistema, dni } = req.params;
  const { descripcion } = req.body;
  fs.readFile(DESCS_FILE, 'utf8', (err, data) => {
    let descripciones = data ? JSON.parse(data) : {};
    if (!descripciones[sistema]) descripciones[sistema] = {};
    descripciones[sistema][dni] = descripcion;
    fs.writeFile(DESCS_FILE, JSON.stringify(descripciones, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'No se pudo guardar descripción' });
      res.json({ ok: true });
    });
  });
});

// Borrar descripción
router.delete('/descripcion/:sistema/:dni', (req, res) => {
  const { sistema, dni } = req.params;
  fs.readFile(DESCS_FILE, 'utf8', (err, data) => {
    let descripciones = data ? JSON.parse(data) : {};
    if (descripciones[sistema]) delete descripciones[sistema][dni];
    fs.writeFile(DESCS_FILE, JSON.stringify(descripciones, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'No se pudo borrar descripción' });
      res.json({ ok: true });
    });
  });
});

module.exports = router;
