// Punto de entrada de la API. Configura Express y monta las rutas.
const express = require('express');
const cors = require('cors');

require('./db'); // Inicializa la base de datos (crea tablas y datos de ejemplo).
const equiposRouter = require('./routes/equipos');
const jugadoresRouter = require('./routes/jugadores');

const app = express();

app.use(cors()); // Permite que la app Flutter (incluida la web) consuma la API.
app.use(express.json()); // Permite leer cuerpos JSON en las peticiones.

// Registro sencillo de peticiones en consola (útil para depurar desde la app).
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${req.url}`);
  next();
});

// Ruta raíz: una pequeña ayuda para saber que la API está viva.
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Equipos y Jugadores',
    endpoints: {
      equipos: '/api/equipos',
      jugadoresDeUnEquipo: '/api/equipos/:id/jugadores',
      jugadores: '/api/jugadores',
    },
  });
});

app.use('/api/equipos', equiposRouter);
app.use('/api/jugadores', jugadoresRouter);

// Manejo básico de errores para no exponer trazas completas.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Render (y otros servicios) asignan el puerto por la variable PORT.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
