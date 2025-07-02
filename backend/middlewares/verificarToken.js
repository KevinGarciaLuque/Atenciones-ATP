// middlewares/verificarToken.js

import jwt from 'jsonwebtoken';

/**
 * ✅ Middleware para verificar si el usuario está autenticado mediante JWT
 */
export const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']; // Formato: Bearer <token>
  
  if (!token) {
    console.log('⚠️ Token no proporcionado en la solicitud');
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  try {
    // Extraer token quitando "Bearer "
    const tokenLimpiado = token.split(' ')[1];

    // Verificar token con la clave secreta
    const decoded = jwt.verify(tokenLimpiado, process.env.JWT_SECRET);

    // Guardar datos del usuario decodificados para uso en las rutas
    req.usuario = decoded;

    console.log('✅ Token válido. Usuario autenticado:', decoded.nombre);
    next();
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
};

/**
 * ✅ Middleware para verificar si el usuario tiene un rol permitido
 * @param {Array} roles - Array de roles permitidos para acceder a la ruta
 * Ejemplo: verificarRol(['administrador', 'oficial_atp'])
 */
export const verificarRol = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      console.log(`⚠️ Acceso denegado para rol: ${req.usuario.rol}`);
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }
    console.log(`✅ Rol autorizado: ${req.usuario.rol}`);
    next();
  };
};
