#!/bin/bash

# Cambiar al directorio de la aplicación
cd /home/site/wwwroot

# Instalar dependencias si es necesario
if [ -f package.json ]; then
    npm install
fi

# Iniciar la aplicación Node.js
node bin/www 