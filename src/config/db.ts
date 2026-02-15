import { Pool, Client } from "pg";
import { env } from "./env.js";
import { seedPatients } from "../seeds/patient.seed.js";

// Configuración de la conexión
const dbConfig = {
  user: env.DB_USER,
  host: env.DB_HOST,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
};

// Cliente para operaciones administrativas (sin base de datos específica)
const adminClient = new Client(dbConfig);

// Cliente para operaciones de la aplicación
let appClient: Client | null = null;

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export async function createDatabaseIfNotExists() {
  try {
    await adminClient.connect();
    console.log("Conectado al servidor PostgreSQL");

    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [env.DB_NAME],
    );

    if (result.rows.length === 0) {
      console.log(`La base de datos "${env.DB_NAME}" no existe. Creando...`);
      await adminClient.query(`CREATE DATABASE "${env.DB_NAME}"`);
      console.log(`✓ Base de datos "${env.DB_NAME}" creada exitosamente`);
    } else {
      console.log(`✓ Base de datos "${env.DB_NAME}" ya existe`);
    }

    await adminClient.end();
  } catch (error: any) {
    console.error("Error al crear la base de datos:", error.message);
    throw error;
  }
}

// Función para crear las tablas
export async function createTables() {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS patient (
                pt_id UUID PRIMARY KEY,
                pt_first_name VARCHAR,
                pt_last_name VARCHAR,
                pt_dob DATE,
                pt_gender VARCHAR,
                pt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS notes (
                nt_id UUID PRIMARY KEY,
                nt_patient_id UUID REFERENCES patient(pt_id),
                nt_raw_input TEXT,
                nt_transcription TEXT,
                nt_ai_summary TEXT,
                nt_audio_url TEXT,
                nt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
            );
        `);
    console.log('✓ Tabla "patient" lista');
  } catch (error: any) {
    console.error("Error al crear tablas:", error.message);
    throw error;
  }
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Conecta a la base de datos
 */
export const connectDB = async (): Promise<Pool> => {
  try {
    await createDatabaseIfNotExists();
    await pool.query("SELECT 1");
    await createTables();
    await seedPatients(pool);
    return pool;
  } catch (error: any) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export const getClient = () => pool;
