// routes/atenciones.js

import express from 'express';
import { db } from '../db.js';
import { verificarToken, verificarRol } from '../middlewares/verificarToken.js';

const router = express.Router();

/**
 * ✅ Registrar atención
 */
router.post('/', verificarToken, verificarRol(['administrador', 'oficial_atp']), async (req, res) => {
  const {
    fecha_solicitud,
    nombre_paciente,
    identidad_paciente,
    edad_paciente,
    especialidad,
    procedencia,
    motivo_solicitud,
    observaciones
  } = req.body;

  try {
    console.log(`📥 Registrando atención para: ${nombre_paciente}, por usuario ID: ${req.usuario.id}`);

    const [result] = await db.query(
      `INSERT INTO atenciones
      (fecha_solicitud, nombre_paciente, identidad_paciente, edad_paciente, especialidad, procedencia, motivo_solicitud, oficial_responsable_id, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fecha_solicitud,
        nombre_paciente,
        identidad_paciente,
        edad_paciente,
        especialidad,
        procedencia,
        motivo_solicitud,
        req.usuario.id,
        observaciones
      ]
    );

    // Registrar en bitácora
    await db.query(
      'INSERT INTO bitacora (usuario_id, accion, descripcion, modulo) VALUES (?, ?, ?, ?)',
      [req.usuario.id, 'crear', `Registró atención para ${nombre_paciente}`, 'atenciones']
    );

    console.log('✅ Atención registrada con ID:', result.insertId);

    res.json({
      mensaje: 'Atención registrada correctamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('❌ Error al registrar atención:', error);
    res.status(500).json({ mensaje: 'Error al registrar atención' });
  }
});

/**
 * ✅ Obtener atenciones con filtro opcional por fechas
 */
router.get('/', verificarToken, async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    console.log('📥 Obteniendo atenciones', desde && hasta ? `desde ${desde} hasta ${hasta}` : '');

    let query = `
      SELECT a.*, u.nombre AS oficial
      FROM atenciones a
      LEFT JOIN usuarios u ON a.oficial_responsable_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (desde && hasta) {
      query += ' AND fecha_solicitud BETWEEN ? AND ?';
      params.push(desde, hasta);
    }

    query += ' ORDER BY a.fecha_solicitud DESC, a.id DESC';

    const [rows] = await db.query(query, params);

    console.log(`✅ Se encontraron ${rows.length} atenciones.`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener atenciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener atenciones' });
  }
});

/**
 * ✅ Dashboard con totales y gráficas
 */
router.get('/dashboard', verificarToken, verificarRol(['administrador', 'oficial_atp']), async (req, res) => {
  try {
    console.log('📥 Solicitando datos del dashboard...');

    const [totalAtenciones] = await db.query('SELECT COUNT(*) AS total FROM atenciones');
    const [porEspecialidad] = await db.query('SELECT especialidad, COUNT(*) AS total FROM atenciones GROUP BY especialidad');
    const [porProcedencia] = await db.query('SELECT procedencia, COUNT(*) AS total FROM atenciones GROUP BY procedencia');
    const [ultimos30] = await db.query(`
      SELECT DATE(fecha_solicitud) AS fecha, COUNT(*) AS total
      FROM atenciones
      WHERE fecha_solicitud >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY fecha
      ORDER BY fecha ASC
    `);

    console.log('✅ Dashboard generado correctamente.');

    res.json({
      totalAtenciones: totalAtenciones[0].total,
      porEspecialidad,
      porProcedencia,
      ultimos30
    });
  } catch (error) {
    console.error('❌ Error al obtener datos del dashboard:', error);
    res.status(500).json({ mensaje: 'Error al obtener datos del dashboard' });
  }
});

export default router;
