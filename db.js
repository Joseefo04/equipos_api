// Configuración de la base de datos SQLite.
//
// Usamos `node:sqlite`, el módulo de SQLite integrado en Node (Node 22.5+, sin
// necesidad de flags desde Node 23.4/24). Al ser parte del propio Node no hay
// ningún binario nativo de npm que compilar ni que pueda fallar al desplegar.

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// El archivo de la base de datos se guarda dentro de la carpeta /data.
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dataDir, 'equipos.db'));

// Activamos las llaves foráneas (necesario en SQLite para el ON DELETE CASCADE).
db.exec('PRAGMA foreign_keys = ON;');

// Creación de las tablas si aún no existen.
db.exec(`
  CREATE TABLE IF NOT EXISTS equipos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre     TEXT    NOT NULL,
    ciudad     TEXT,
    estadio    TEXT,
    fundacion  INTEGER,
    imagen_url TEXT
  );

  CREATE TABLE IF NOT EXISTS jugadores (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    equipo_id    INTEGER NOT NULL,
    nombre       TEXT    NOT NULL,
    posicion     TEXT,
    dorsal       INTEGER,
    nacionalidad TEXT,
    imagen_url   TEXT,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
  );
`);

// Si no hay equipos, sembramos datos de ejemplo para poder probar la app.
const total = db.prepare('SELECT COUNT(*) AS c FROM equipos').get().c;
if (total === 0) {
  sembrarDatos();
}

function sembrarDatos() {
  const insertarEquipo = db.prepare(
    `INSERT INTO equipos (nombre, ciudad, estadio, fundacion, imagen_url)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const insertarJugador = db.prepare(
    `INSERT INTO jugadores (equipo_id, nombre, posicion, dorsal, nacionalidad, imagen_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const equipos = [
    {
      nombre: 'FC Barcelona',
      ciudad: 'Barcelona',
      estadio: 'Spotify Camp Nou',
      fundacion: 1899,
      imagen_url: 'https://picsum.photos/seed/barcelona/800/300',
      jugadores: [
        { nombre: 'Marc-André ter Stegen', posicion: 'Portero', dorsal: 1, nacionalidad: 'Alemania', imagen_url: 'https://i.pravatar.cc/300?img=13' },
        { nombre: 'Frenkie de Jong', posicion: 'Centrocampista', dorsal: 21, nacionalidad: 'Países Bajos', imagen_url: 'https://i.pravatar.cc/300?img=14' },
        { nombre: 'Robert Lewandowski', posicion: 'Delantero', dorsal: 9, nacionalidad: 'Polonia', imagen_url: 'https://i.pravatar.cc/300?img=15' },
        { nombre: 'Lamine Yamal', posicion: 'Extremo', dorsal: 19, nacionalidad: 'España', imagen_url: 'https://i.pravatar.cc/300?img=33' },
      ],
    },
    {
      nombre: 'Real Madrid',
      ciudad: 'Madrid',
      estadio: 'Santiago Bernabéu',
      fundacion: 1902,
      imagen_url: 'https://picsum.photos/seed/realmadrid/800/300',
      jugadores: [
        { nombre: 'Thibaut Courtois', posicion: 'Portero', dorsal: 1, nacionalidad: 'Bélgica', imagen_url: 'https://i.pravatar.cc/300?img=51' },
        { nombre: 'Jude Bellingham', posicion: 'Centrocampista', dorsal: 5, nacionalidad: 'Inglaterra', imagen_url: 'https://i.pravatar.cc/300?img=52' },
        { nombre: 'Vinícius Júnior', posicion: 'Extremo', dorsal: 7, nacionalidad: 'Brasil', imagen_url: 'https://i.pravatar.cc/300?img=53' },
        { nombre: 'Kylian Mbappé', posicion: 'Delantero', dorsal: 9, nacionalidad: 'Francia', imagen_url: 'https://i.pravatar.cc/300?img=54' },
      ],
    },
    {
      nombre: 'Manchester City',
      ciudad: 'Manchester',
      estadio: 'Etihad Stadium',
      fundacion: 1880,
      imagen_url: 'https://picsum.photos/seed/mancity/800/300',
      jugadores: [
        { nombre: 'Ederson', posicion: 'Portero', dorsal: 31, nacionalidad: 'Brasil', imagen_url: 'https://i.pravatar.cc/300?img=60' },
        { nombre: 'Rodri', posicion: 'Centrocampista', dorsal: 16, nacionalidad: 'España', imagen_url: 'https://i.pravatar.cc/300?img=61' },
        { nombre: 'Erling Haaland', posicion: 'Delantero', dorsal: 9, nacionalidad: 'Noruega', imagen_url: 'https://i.pravatar.cc/300?img=62' },
        { nombre: 'Phil Foden', posicion: 'Centrocampista', dorsal: 47, nacionalidad: 'Inglaterra', imagen_url: 'https://i.pravatar.cc/300?img=63' },
      ],
    },
  ];

  db.exec('BEGIN');
  try {
    for (const equipo of equipos) {
      const info = insertarEquipo.run(
        equipo.nombre,
        equipo.ciudad,
        equipo.estadio,
        equipo.fundacion,
        equipo.imagen_url,
      );
      const equipoId = info.lastInsertRowid;
      for (const j of equipo.jugadores) {
        insertarJugador.run(
          equipoId,
          j.nombre,
          j.posicion,
          j.dorsal,
          j.nacionalidad,
          j.imagen_url,
        );
      }
    }
    db.exec('COMMIT');
    console.log('Base de datos sembrada con datos de ejemplo.');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

module.exports = db;
