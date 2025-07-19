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

// Edit data endpoint
app.post('/data/:sistema/editar/:dni', (req, res) => {
  const sistema = req.params.sistema;
  const dni = req.params.dni;
  const { campo, valor } = req.body;
  
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
    
    // Encontrar el registro por DNI
    const registroIndex = registros.findIndex(r => r.Column9 && r.Column9.toString() === dni);
    
    if (registroIndex === -1) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    // Mapear el campo amigable de vuelta a la columna original
    const reverseColumnMap = {};
    Object.entries(columnMap).forEach(([original, friendly]) => {
      reverseColumnMap[friendly] = original;
    });
    
    const campoOriginal = reverseColumnMap[campo] || campo;
    registros[registroIndex][campoOriginal] = valor;
    
    // Guardar el archivo
    const dataToSave = Array.isArray(json) ? registros : { ...json, Hoja1: registros };
    
    fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing file:', writeErr);
        return res.status(500).json({ error: 'No se pudo guardar los cambios' });
      }
      res.json({ success: true, message: 'Datos actualizados correctamente' });
    });
  });
});

// Description endpoints
app.get('/descripcion/:sistema/:dni', (req, res) => {
  const sistema = req.params.sistema;
  const dni = req.params.dni;
  const descFilePath = path.join(__dirname, 'backend/data/descripciones.json');
  
  fs.readFile(descFilePath, 'utf8', (err, data) => {
    if (err) {
      // Si el archivo no existe, devolver descripción vacía
      return res.json({ descripcion: '' });
    }
    
    try {
      const descripciones = JSON.parse(data);
      const key = `${sistema}_${dni}`;
      res.json({ descripcion: descripciones[key] || '' });
    } catch (parseErr) {
      res.json({ descripcion: '' });
    }
  });
});

app.post('/descripcion/:sistema/:dni', (req, res) => {
  const sistema = req.params.sistema;
  const dni = req.params.dni;
  const { descripcion } = req.body;
  const descFilePath = path.join(__dirname, 'backend/data/descripciones.json');
  
  // Leer descripciones existentes o crear nuevo objeto
  let descripciones = {};
  try {
    const data = fs.readFileSync(descFilePath, 'utf8');
    descripciones = JSON.parse(data);
  } catch (err) {
    // Archivo no existe, usar objeto vacío
  }
  
  // Guardar nueva descripción
  const key = `${sistema}_${dni}`;
  descripciones[key] = descripcion;
  
  // Escribir archivo
  fs.writeFile(descFilePath, JSON.stringify(descripciones, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing description file:', err);
      return res.status(500).json({ error: 'No se pudo guardar la descripción' });
    }
    res.json({ success: true, message: 'Descripción guardada correctamente' });
  });
});

app.delete('/descripcion/:sistema/:dni', (req, res) => {
  const sistema = req.params.sistema;
  const dni = req.params.dni;
  const descFilePath = path.join(__dirname, 'backend/data/descripciones.json');
  
  try {
    const data = fs.readFileSync(descFilePath, 'utf8');
    const descripciones = JSON.parse(data);
    const key = `${sistema}_${dni}`;
    
    if (descripciones[key]) {
      delete descripciones[key];
      fs.writeFileSync(descFilePath, JSON.stringify(descripciones, null, 2), 'utf8');
      res.json({ success: true, message: 'Descripción eliminada correctamente' });
    } else {
      res.json({ success: true, message: 'No había descripción para eliminar' });
    }
  } catch (err) {
    res.json({ success: true, message: 'No había descripción para eliminar' });
  }
});

// User management endpoints
app.post('/users/register', (req, res) => {
  const { username, password } = req.body;
  const usersFilePath = path.join(__dirname, 'backend/data/users.json');
  
  // Validaciones
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
  }
  
  if (password.length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  }
  
  try {
    // Leer usuarios existentes
    const data = fs.readFileSync(usersFilePath, 'utf8');
    const usersData = JSON.parse(data);
    
    // Verificar si el usuario ya existe
    const userExists = usersData.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (userExists) {
      return res.status(400).json({ error: 'Este usuario ya existe' });
    }
    
    // Agregar nuevo usuario
    const newUser = {
      username: username,
      password: password,
      createdAt: new Date().toISOString(),
      isDefault: false
    };
    
    usersData.users.push(newUser);
    
    // Guardar archivo
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');
    
    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  const usersFilePath = path.join(__dirname, 'backend/data/users.json');
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }
  
  try {
    // Leer usuarios
    const data = fs.readFileSync(usersFilePath, 'utf8');
    const usersData = JSON.parse(data);
    
    // Buscar usuario
    const user = usersData.users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );
    
    if (user) {
      res.json({ 
        success: true, 
        message: 'Login exitoso',
        user: {
          username: user.username,
          createdAt: user.createdAt,
          isDefault: user.isDefault
        }
      });
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Error durante el login' });
  }
});

app.get('/users', (req, res) => {
  const usersFilePath = path.join(__dirname, 'backend/data/users.json');
  
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    const usersData = JSON.parse(data);
    
    // Devolver solo información pública (sin contraseñas)
    const publicUsers = usersData.users.map(user => ({
      username: user.username,
      createdAt: user.createdAt,
      isDefault: user.isDefault
    }));
    
    res.json({ users: publicUsers });
  } catch (err) {
    console.error('Error reading users:', err);
    res.status(500).json({ error: 'Error al leer usuarios' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Ping test: http://localhost:${PORT}/ping`);
  console.log(`Giankar data: http://localhost:${PORT}/data/giankar`);
}); 