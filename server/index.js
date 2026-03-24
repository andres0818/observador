const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Ajustar según requerimientos del host
  }
});

// Configuración de CORS más robusta
app.use(cors({
  origin: '*', // Permite peticiones desde cualquier origen en desarrollo
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Probar conexión a la DB inmediatamente
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error adquiriendo cliente de la DB:', err.stack);
  }
  console.log('✅ Conexión a PostgreSQL establecida con éxito');
  release();
});

// Inicializar tabla si no existe
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS observations (
        id SERIAL PRIMARY KEY,
        member_id VARCHAR(50) NOT NULL,
        type VARCHAR(10) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla observations verificada/creada');
  } catch (err) {
    console.error('Error inicializando DB:', err);
  }
};

initDb();

// Endpoints
app.get('/api/observations', async (req, res) => {
  const { days } = req.query;
  try {
    let query = 'SELECT * FROM observations';
    let params = [];

    if (days && days !== 'null' && days !== 'all') {
      query += ' WHERE created_at >= NOW() - $1::INTERVAL';
      params.push(`${days} days`);
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener observaciones' });
  }
});

app.post('/api/observations', async (req, res) => {
  const { memberId, type, comment } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO observations (member_id, type, comment) VALUES ($1, $2, $3) RETURNING *',
      [memberId, type, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear observación' });
  }
});

app.listen(port, () => {
  console.log(`Servidor API corriendo en puerto ${port}`);
});
