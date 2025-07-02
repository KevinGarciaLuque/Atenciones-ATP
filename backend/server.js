// server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.js';
import atencionesRoutes from './routes/atenciones.js';
import bitacoraRoutes from './routes/bitacora.js';
import usuariosRoutes from './routes/usuarios.js';


const app = express();
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/atenciones', atencionesRoutes);
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/usuarios', usuariosRoutes);



// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
