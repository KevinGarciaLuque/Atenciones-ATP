// routes/auth.js

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';

const router = express.Router();

/**
 * ✅ Ruta de login
 * URL: POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    // Depuración opcional:
    console.log('📥 Intento de login con usuario:', usuario);

    // Buscar usuario activo en la base de datos
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE usuario = ? AND activo = TRUE',
      [usuario]
    );

    if (rows.length === 0) {
      console.log('⚠️ Usuario no encontrado o inactivo');
      return res.status(404).json({ mensaje: 'Usuario no encontrado o inactivo' });
    }

    const usuarioDB = rows[0];

    // Comparar contraseñas usando bcrypt
    const passwordOk = await bcrypt.compare(contrasena, usuarioDB.contrasena);
    if (!passwordOk) {
      console.log('⚠️ Contraseña incorrecta para usuario:', usuario);
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuarioDB.id,
        nombre: usuarioDB.nombre,
        rol: usuarioDB.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('✅ Usuario autenticado:', usuarioDB.usuario);

    // Responder con token y datos de usuario
    res.json({
      token,
      usuario: {
        id: usuarioDB.id,
        nombre: usuarioDB.nombre,
        rol: usuarioDB.rol
      }
    });
  } catch (error) {
    console.error('❌ Error en /api/auth/login:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

export default router;
