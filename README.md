# equipos_api

API REST de **Equipos y Jugadores** hecha con **Node + Express + SQLite**
(`node:sqlite`, el módulo integrado de Node, sin dependencias nativas).
Es la API que consume la app Flutter `equipos_app`.

## Requisitos

- Node.js 22.5 o superior (recomendado **Node 24**, por el módulo `node:sqlite`).

## Instalación y ejecución local

```bash
cd equipos_api
npm install
npm start
```

El servidor queda escuchando en `http://localhost:3000`.
La primera vez se crea el archivo `data/equipos.db` y se cargan datos de ejemplo
(3 equipos con sus jugadores). Para desarrollo con recarga automática: `npm run dev`.

## Modelo de datos

**equipos**

| campo        | tipo    | notas                     |
|--------------|---------|---------------------------|
| id           | INTEGER | clave primaria            |
| nombre       | TEXT    | obligatorio               |
| ciudad       | TEXT    |                           |
| estadio      | TEXT    |                           |
| fundacion    | INTEGER | año de fundación          |
| imagen_url   | TEXT    | URL de la imagen (banner) |

**jugadores**

| campo        | tipo    | notas                                     |
|--------------|---------|-------------------------------------------|
| id           | INTEGER | clave primaria                            |
| equipo_id    | INTEGER | obligatorio, FK -> equipos.id (cascada)   |
| nombre       | TEXT    | obligatorio                               |
| posicion     | TEXT    |                                           |
| dorsal       | INTEGER | número de camiseta                        |
| nacionalidad | TEXT    |                                           |
| imagen_url   | TEXT    | URL de la imagen (foto)                   |

Al borrar un equipo se borran también sus jugadores (ON DELETE CASCADE).

## Endpoints

| Método | Ruta                          | Descripción                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/equipos`                | Lista todos los equipos              |
| GET    | `/api/equipos/:id`            | Un equipo                            |
| GET    | `/api/equipos/:id/jugadores`  | Jugadores de ese equipo              |
| POST   | `/api/equipos`                | Crea un equipo                       |
| PUT    | `/api/equipos/:id`            | Actualiza un equipo                  |
| DELETE | `/api/equipos/:id`            | Borra un equipo (y sus jugadores)    |
| GET    | `/api/jugadores`              | Lista todos los jugadores            |
| GET    | `/api/jugadores?equipoId=1`   | Jugadores de un equipo               |
| GET    | `/api/jugadores/:id`          | Un jugador                           |
| POST   | `/api/jugadores`              | Crea un jugador                      |
| PUT    | `/api/jugadores/:id`          | Actualiza un jugador                 |
| DELETE | `/api/jugadores/:id`          | Borra un jugador                     |

### Ejemplo de cuerpo (POST/PUT equipo)

```json
{
  "nombre": "FC Barcelona",
  "ciudad": "Barcelona",
  "estadio": "Spotify Camp Nou",
  "fundacion": 1899,
  "imagen_url": "https://picsum.photos/seed/barcelona/800/300"
}
```

### Ejemplo de cuerpo (POST/PUT jugador)

```json
{
  "equipo_id": 1,
  "nombre": "Robert Lewandowski",
  "posicion": "Delantero",
  "dorsal": 9,
  "nacionalidad": "Polonia",
  "imagen_url": "https://i.pravatar.cc/300?img=15"
}
```

## Despliegue en Render

1. Sube esta carpeta a un repositorio de GitHub.
2. En Render: **New > Web Service** y conecta el repositorio.
3. Configura:
   - **Root Directory**: `equipos_api` (si el repo contiene varias carpetas).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Render asigna el puerto por la variable de entorno `PORT` (el código ya lo usa).

> Nota: en el plan gratuito de Render el disco es **efímero**: el archivo
> `data/equipos.db` se reinicia con cada despliegue y la app vuelve a cargar
> los datos de ejemplo. Para una base de datos persistente, añade un
> *Persistent Disk* o usa una base de datos gestionada.

Cuando la API esté desplegada, copia su URL (por ejemplo
`https://equipos-api.onrender.com`) en `equipos_app/lib/config.dart`.
