import express from 'express';
import { db } from '../db.js';
import { verificarToken, verificarRol } from '../middlewares/verificarToken.js';

const router = express.Router();

// Dashboard de usuarios y atenciones por rol
router.get('/', verificarToken, verificarRol(['administrador']), async (req, res) => {
  try {
    const [oficiales] = await db.query("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'oficial_atp' AND activo = TRUE");
    const [voluntarios] = await db.query("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'voluntario' AND activo = TRUE");
    const [atencionesOficiales] = await db.query(`
      SELECT COUNT(*) AS total FROM atenciones a
      JOIN usuarios u ON a.oficial_responsable_id = u.id
      WHERE u.rol = 'oficial_atp'
    `);
    const [atencionesVoluntarios] = await db.query(`
      SELECT COUNT(*) AS total FROM atenciones a
      JOIN usuarios u ON a.oficial_responsable_id = u.id
      WHERE u.rol = 'voluntario'
    `);

    res.json({
      totalOficiales: oficiales[0].total,
      totalVoluntarios: voluntarios[0].total,
      atencionesOficiales: atencionesOficiales[0].total,
      atencionesVoluntarios: atencionesVoluntarios[0].total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener métricas de usuarios' });
  }
});

export default router;
