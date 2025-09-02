@echo off
title Fabrica de Contenido v5.0 Server
echo Iniciando el servidor y abriendo la aplicacion...

:: Navega al directorio del proyecto
cd /d "d:\app4"

:: Abre la URL en el navegador por defecto
start http://localhost:5173

:: Inicia el servidor de desarrollo
npm run dev
