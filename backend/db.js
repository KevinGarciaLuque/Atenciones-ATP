// db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno del archivo .env
dotenv.config();

// Crear y exportar el pool de conexiones MySQL
export const db = mysql.createPool({
  host: process.env.DB_HOST,         // localhost
  user: process.env.DB_USER,         // root
  password: process.env.DB_PASSWORD, // 123456789
  database: process.env.DB_NAME      // atp_hospital_maria
});

// Verificar conexión (opcional para depuración)
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Conexión exitosa a MySQL (ATP Hospital María)');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error);
  }
})();
