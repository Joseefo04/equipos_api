// Pequeñas utilidades compartidas por las rutas.

// Convierte un valor a entero, o devuelve null si viene vacío / no es válido.
// Sirve para campos numéricos como "fundacion" o "dorsal" que pueden llegar
// como cadena de texto o vacíos desde el formulario de Flutter.
function toIntOrNull(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const n = parseInt(valor, 10);
  return Number.isNaN(n) ? null : n;
}

// Convierte un valor a texto recortado, o null si viene vacío.
function toStrOrNull(valor) {
  if (valor === undefined || valor === null) return null;
  const s = String(valor).trim();
  return s === '' ? null : s;
}

module.exports = { toIntOrNull, toStrOrNull };
