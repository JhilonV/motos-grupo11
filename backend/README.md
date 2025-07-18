# Despliegue en Azure App Service

1. Sube el código a un repositorio (GitHub recomendado).
2. En Azure Portal, crea un recurso App Service para Node.js.
3. Conecta tu App Service al repositorio y rama deseada.
4. Asegúrate de que el App Service use Node.js y que el script de inicio sea `npm start`.
5. Si necesitas variables de entorno, configúralas en la sección de "Configuration" del App Service.
6. El backend escuchará automáticamente en el puerto que Azure le asigne (`process.env.PORT`).
7. Si tu frontend lo necesita, expón la URL pública del backend y configúrala en el frontend como `REACT_APP_API_URL`. 