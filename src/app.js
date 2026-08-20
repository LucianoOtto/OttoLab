const dns = require('node:dns');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

dns.setDefaultResultOrder('ipv4first');

const app = express();

// Configuración de CORS
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite peticiones sin origen (como Postman o llamadas servidor a servidor)
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('No permitido por CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/uploads', express.static(require('path').join(__dirname, '..', 'uploads')));

app.use('/api', routes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use(errorHandler);

module.exports = app;