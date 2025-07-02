import express from 'express';
import { db } from '../db.js';
import { verificarToken, verificarRol } from '../middlewares/verificarToken.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

/**
 * ✅ Crear usuario (solo administrador)
 */
router.post('/', verificarToken, verificarRol(['administrador']), async (req, res) => {
  const { nombre, usuario, contrasena, rol } = req.body;
  try {
    const hash = await bcrypt.hash(contrasena, 10);
    await db.query(
      `INSERT INTO usuarios (nombre, usuario, contrasena, rol) VALUES (?, ?, ?, ?)`,
      [nombre, usuario, hash, rol]
    );

    await db.query(
      `INSERT INTO bitacora (usuario_id, accion, descripcion, modulo) VALUES (?, ?, ?, ?)`,
      [req.usuario.id, 'crear', `Creó el usuario ${nombre} (${usuario}) con rol ${rol}`, 'usuarios']
    );

    res.json({ mensaje: 'Usuario creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear usuario' });
  }
});

/**
 * ✅ Obtener todos los usuarios (solo administrador)
 */
router.get('/', verificarToken, verificarRol(['administrador']), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, usuario, rol, activo FROM usuarios`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

/**
 * ✅ Actualizar usuario (solo administrador)
 * Permite actualizar nombre, usuario, rol y contraseña (opcional)
 */
router.put('/:id', verificarToken, verificarRol(['administrador']), async (req, res) => {
  const { id } = req.params;
  const { nombre, usuario, contrasena, rol } = req.body;

  try {
    if (contrasena && contrasena.trim() !== '') {
      const hash = await bcrypt.hash(contrasena, 10);
      await db.query(
        `UPDATE usuarios SET nombre = ?, usuario = ?, contrasena = ?, rol = ? WHERE id = ?`,
        [nombre, usuario, hash, rol, id]
      );
    } else {
      await db.query(
        `UPDATE usuarios SET nombre = ?, usuario = ?, rol = ? WHERE id = ?`,
        [nombre, usuario, rol, id]
      );
    }

    await db.query(
      `INSERT INTO bitacora (usuario_id, accion, descripcion, modulo) VALUES (?, ?, ?, ?)`,
      [req.usuario.id, 'actualizar', `Actualizó usuario con ID ${id}`, 'usuarios']
    );

    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
});

/**
 * ✅ Activar usuario (solo administrador)
 */
router.put('/activar/:id', verificarToken, verificarRol(['administrador']), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`UPDATE usuarios SET activo = 1 WHERE id = ?`, [id]);

    await db.query(
      `INSERT INTO bitacora (usuario_id, accion, descripcion, modulo) VALUES (?, ?, ?, ?)`,
      [req.usuario.id, 'activar', `Activó usuario con ID ${id}`, 'usuarios']
    );

    res.json({ mensaje: 'Usuario activado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al activar usuario' });
  }
});

/**
 * ✅ Desactivar usuario (solo administrador)
 */
router.put('/desactivar/:id', verificarToken, verificarRol(['administrador']), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`UPDATE usuarios SET activo = 0 WHERE id = ?`, [id]);

    await db.query(
      `INSERT INTO bitacora (usuario_id, accion, descripcion, modulo) VALUES (?, ?, ?, ?)`,
      [req.usuario.id, 'desactivar', `Desactivó usuario con ID ${id}`, 'usuarios']
    );

    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al desactivar usuario' });
  }
});

/**
 * ✅ Eliminar usuario (solo administrador)
 */
router.delete('/:id', verificarToken, verificarRol(['administrador']), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM usuarios WHERE id = ?`, [id]);

    await db.query(
      `INSERT INTO bitacora (usuario_id, accion, descripcion, modulo) VALUES (?, ?, ?, ?)`,
      [req.usuario.id, 'eliminar', `Eliminó usuario con ID ${id}`, 'usuarios']
    );

    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

export default router;
