import express from 'express'; 
import { db } from '../db.js';
import { verificarToken, verificarRol } from '../middlewares/verificarToken.js';

const router = express.Router();

router.get('/', verificarToken, verificarRol(['administrador']), async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    let query = `
      SELECT 
        b.id, 
        b.fecha, 
        u.nombre AS usuario, 
        u.rol,
        b.accion, 
        b.descripcion, 
        b.modulo
      FROM bitacora b
      LEFT JOIN usuarios u ON b.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (desde && hasta) {
      query += ' AND DATE(b.fecha) BETWEEN ? AND ?';
      params.push(desde, hasta);
    }

    query += ' ORDER BY b.fecha DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener bitácora' });
  }
});

export default router;
