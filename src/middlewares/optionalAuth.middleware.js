const { verifyToken } = require('../utils/jwt');

// A diferencia de auth.middleware, no rechaza la petición si no hay token.
// Se usa en rutas públicas donde el admin logueado debe ver más datos
// (ej: productos inactivos) que un visitante anónimo.
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyToken(token);
    } catch (err) {
      // Token inválido/expirado: seguimos como visitante anónimo.
    }
  }

  next();
}

module.exports = optionalAuth;