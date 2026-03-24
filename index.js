const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

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
    res.status(500).json({ error: 'Error al crear observación' });
  }
});

// Cualquier otra ruta sirve el index.html de React (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor unificado corriendo en puerto ${port}`);
});
