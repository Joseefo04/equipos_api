// Rutas del recurso "jugadores": /api/jugadores
const express = require('express');
const db = require('../db');
const { toIntOrNull, toStrOrNull } = require('../helpers');

const router = express.Router();

// GET /api/jugadores            -> todos los jugadores
// GET /api/jugadores?equipoId=1 -> jugadores de un equipo en concreto
router.get('/', (req, res) => {
  const { equipoId } = req.query;
  let jugadores;
  if (equipoId) {
    jugadores = db
      .prepare('SELECT * FROM jugadores WHERE equipo_id = ? ORDER BY dorsal, id')
      .all(equipoId);
  } else {
    jugadores = db.prepare('SELECT * FROM jugadores ORDER BY id').all();
  }
  res.json(jugadores);
});

// GET /api/jugadores/:id  -> un jugador por su id
router.get('/:id', (req, res) => {
  const jugador = db.prepare('SELECT * FROM jugadores WHERE id = ?').get(req.params.id);
  if (!jugador) {
    return res.status(404).json({ error: 'Jugador no encontrado' });
  }
  res.json(jugador);
});

// POST /api/jugadores  -> crear un jugador
router.post('/', (req, res) => {
  const nombre = toStrOrNull(req.body.nombre);
  const equipoId = toIntOrNull(req.body.equipo_id);

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (!equipoId) {
    return res.status(400).json({ error: 'El equipo_id es obligatorio' });
  }

  // Verificamos que el equipo exista antes de asociar el jugador.
  const equipo = db.prepare('SELECT id FROM equipos WHERE id = ?').get(equipoId);
  if (!equipo) {
    return res.status(400).json({ error: 'El equipo indicado no existe' });
  }

  const info = db
    .prepare(
      `INSERT INTO jugadores (equipo_id, nombre, posicion, dorsal, nacionalidad, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      equipoId,
      nombre,
      toStrOrNull(req.body.posicion),
      toIntOrNull(req.body.dorsal),
      toStrOrNull(req.body.nacionalidad),
      toStrOrNull(req.body.imagen_url),
    );

  const nuevo = db.prepare('SELECT * FROM jugadores WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(nuevo);
});

// PUT /api/jugadores/:id  -> actualizar un jugador
router.put('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM jugadores WHERE id = ?').get(req.params.id);
  if (!existente) {
    return res.status(404).json({ error: 'Jugador no encontrado' });
  }

  const nombre = toStrOrNull(req.body.nombre);
  const equipoId = toIntOrNull(req.body.equipo_id);

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (!equipoId) {
    return res.status(400).json({ error: 'El equipo_id es obligatorio' });
  }

  const equipo = db.prepare('SELECT id FROM equipos WHERE id = ?').get(equipoId);
  if (!equipo) {
    return res.status(400).json({ error: 'El equipo indicado no existe' });
  }

  db.prepare(
    `UPDATE jugadores
     SET equipo_id = ?, nombre = ?, posicion = ?, dorsal = ?, nacionalidad = ?, imagen_url = ?
     WHERE id = ?`,
  ).run(
    equipoId,
    nombre,
    toStrOrNull(req.body.posicion),
    toIntOrNull(req.body.dorsal),
    toStrOrNull(req.body.nacionalidad),
    toStrOrNull(req.body.imagen_url),
    req.params.id,
  );

  const actualizado = db.prepare('SELECT * FROM jugadores WHERE id = ?').get(req.params.id);
  res.json(actualizado);
});

// DELETE /api/jugadores/:id  -> eliminar un jugador
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM jugadores WHERE id = ?').run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Jugador no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
