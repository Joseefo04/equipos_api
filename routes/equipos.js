// Rutas del recurso "equipos": /api/equipos
const express = require('express');
const db = require('../db');
const { toIntOrNull, toStrOrNull } = require('../helpers');

const router = express.Router();

// GET /api/equipos  -> lista de todos los equipos
router.get('/', (req, res) => {
  const equipos = db.prepare('SELECT * FROM equipos ORDER BY id').all();
  res.json(equipos);
});

// GET /api/equipos/:id  -> un equipo por su id
router.get('/:id', (req, res) => {
  const equipo = db.prepare('SELECT * FROM equipos WHERE id = ?').get(req.params.id);
  if (!equipo) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }
  res.json(equipo);
});

// GET /api/equipos/:id/jugadores  -> jugadores que pertenecen al equipo
router.get('/:id/jugadores', (req, res) => {
  const equipo = db.prepare('SELECT * FROM equipos WHERE id = ?').get(req.params.id);
  if (!equipo) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }
  const jugadores = db
    .prepare('SELECT * FROM jugadores WHERE equipo_id = ? ORDER BY dorsal, id')
    .all(req.params.id);
  res.json(jugadores);
});

// POST /api/equipos  -> crear un equipo
router.post('/', (req, res) => {
  const nombre = toStrOrNull(req.body.nombre);
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  const info = db
    .prepare(
      `INSERT INTO equipos (nombre, ciudad, estadio, fundacion, imagen_url)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      nombre,
      toStrOrNull(req.body.ciudad),
      toStrOrNull(req.body.estadio),
      toIntOrNull(req.body.fundacion),
      toStrOrNull(req.body.imagen_url),
    );

  const nuevo = db.prepare('SELECT * FROM equipos WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(nuevo);
});

// PUT /api/equipos/:id  -> actualizar un equipo
router.put('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM equipos WHERE id = ?').get(req.params.id);
  if (!existente) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }

  const nombre = toStrOrNull(req.body.nombre);
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  db.prepare(
    `UPDATE equipos
     SET nombre = ?, ciudad = ?, estadio = ?, fundacion = ?, imagen_url = ?
     WHERE id = ?`,
  ).run(
    nombre,
    toStrOrNull(req.body.ciudad),
    toStrOrNull(req.body.estadio),
    toIntOrNull(req.body.fundacion),
    toStrOrNull(req.body.imagen_url),
    req.params.id,
  );

  const actualizado = db.prepare('SELECT * FROM equipos WHERE id = ?').get(req.params.id);
  res.json(actualizado);
});

// DELETE /api/equipos/:id  -> eliminar un equipo (y sus jugadores en cascada)
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM equipos WHERE id = ?').run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
