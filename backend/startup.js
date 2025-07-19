const { spawn } = require('child_process');
const path = require('path');

// Ruta al archivo principal de la aplicación
const appPath = path.join(__dirname, 'bin', 'www');

// Iniciar la aplicación
const child = spawn('node', [appPath], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
}); 