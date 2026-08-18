const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('escuela.db');

// 1. Activar las claves foráneas (Foreign Keys)
db.exec('PRAGMA foreign_keys = ON;');

// 2. Limpiar las tablas antes de empezar para evitar duplicados
// El orden es importante: primero borramos la tabla que depende de otras.
db.exec('DROP TABLE IF EXISTS inscripciones');
db.exec('DROP TABLE IF EXISTS cursos');
db.exec('DROP TABLE IF EXISTS alumnos');

// 3. Crear las tablas nuevamente
db.exec(`
  CREATE TABLE alumnos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    seccion TEXT NOT NULL,
    edad INTEGER
  )
`);

db.exec(`
  CREATE TABLE cursos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE inscripciones (
    alumno_id INTEGER,
    curso_id INTEGER,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
  )
`);

// 4. Insertar los datos (ahora siempre empezaremos desde cero)
const alumnos = [
  { nombre: 'Ana', seccion: '1114', edad: 19 },
  { nombre: 'Luis', seccion: '1114', edad: 21 },
  { nombre: 'Marta', seccion: '1113', edad: 20 },
  { nombre: 'Pedro', seccion: '1114', edad: 18 },
];

const insert = db.prepare('INSERT INTO alumnos (nombre, seccion, edad) VALUES (?, ?, ?)');
for (const a of alumnos) {
  insert.run(a.nombre, a.seccion, a.edad);
}

console.log('Datos cargados en escuela.db\n');

// --- Consultas y Operaciones ---

const selSeccion = db.prepare('SELECT * FROM alumnos WHERE seccion = ?');
console.log('Alumnos de 1114:', selSeccion.all('1114'));

const selMayores = db.prepare('SELECT nombre, edad FROM alumnos WHERE edad >= ? ORDER BY edad');
console.log('\nMayores de 20:', selMayores.all(20));

const selPrimero = db.prepare('SELECT * FROM alumnos ORDER BY edad DESC LIMIT 1');
console.log('\nEl mas grande:', selPrimero.get());

const selCuenta = db.prepare('SELECT COUNT(*) AS total FROM alumnos');
console.log('\nTotal de alumnos:', selCuenta.get());

const actualizar = db.prepare('UPDATE alumnos SET edad = ? WHERE nombre = ?');
const cambio = actualizar.run(22, 'Ana');
console.log('\nFilas actualizadas:', cambio.changes);

const borrar = db.prepare('DELETE FROM alumnos WHERE nombre = ?');
const borrado = borrar.run('Marta');
console.log('Filas borradas:', borrado.changes);

const rows = selSeccion.all('1114');
const json = JSON.stringify(rows, null, 2);
console.log('\nComo JSON:');
console.log(json);

// 5. CERRAR la base de datos (Muy importante)
db.close();