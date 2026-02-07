import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

// Configuración de la conexión
const dbConfig = {
  user: "postgres",
  host: "localhost",
  password: "Chris220321!",
  port: 5432,
};

const DB_NAME = "carescribe_ai_db";

// Cliente para operaciones administrativas (sin base de datos específica)
const adminClient = new Client(dbConfig);

// Cliente para operaciones de la aplicación
let appClient = null;

// Función para crear la base de datos si no existe
async function createDatabaseIfNotExists() {
  try {
    await adminClient.connect();
    console.log("Conectado al servidor PostgreSQL");

    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME],
    );

    if (result.rows.length === 0) {
      console.log(`La base de datos "${DB_NAME}" no existe. Creando...`);
      await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`✓ Base de datos "${DB_NAME}" creada exitosamente`);
    } else {
      console.log(`✓ Base de datos "${DB_NAME}" ya existe`);
    }

    await adminClient.end();
  } catch (error) {
    console.error("Error al crear la base de datos:", error.message);
    throw error;
  }
}

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    appClient = new Client({
      ...dbConfig,
      database: DB_NAME,
    });

    await appClient.connect();
    console.log(`✓ Conectado a la base de datos "${DB_NAME}"`);
    return appClient;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error.message);
    throw error;
  }
}

// Función para crear las tablas
async function createTables() {
  try {
    await appClient.query(`
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
  } catch (error) {
    console.error("Error al crear tablas:", error.message);
    throw error;
  }
}

// Función para insertar datos iniciales
async function insertInitialData() {
  try {
    const checkQuery = await appClient.query(
      "SELECT COUNT(*) as count FROM patient",
    );

    if (parseInt(checkQuery.rows[0].count) === 0) {
      const patients = [
        {
          pt_id: uuidv4(),
          pt_first_name: "Juan",
          pt_last_name: "Pérez",
          pt_dob: "1994-01-15",
          pt_gender: "Masculino",
        },
        {
          pt_id: uuidv4(),
          pt_first_name: "María",
          pt_last_name: "López",
          pt_dob: "1999-03-22",
          pt_gender: "Femenino",
        },
        {
          pt_id: uuidv4(),
          pt_first_name: "Carlos",
          pt_last_name: "García",
          pt_dob: "1984-07-10",
          pt_gender: "Masculino",
        },
      ];

      for (const patient of patients) {
        await appClient.query(
          "INSERT INTO patient (pt_id, pt_first_name, pt_last_name, pt_dob, pt_gender) VALUES ($1, $2, $3, $4, $5)",
          [
            patient.pt_id,
            patient.pt_first_name,
            patient.pt_last_name,
            patient.pt_dob,
            patient.pt_gender,
          ],
        );
      }
    }
  } catch (error) {
    console.error("Error al insertar datos:", error.message);
    throw error;
  }
}

// Función principal de inicialización
async function initializeDatabase() {
  try {
    console.log("Inicializando base de datos...\n");

    await createDatabaseIfNotExists();
    await connectToDatabase();
    await createTables();
    await insertInitialData();

    console.log("\n✓ Base de datos inicializada correctamente");
    return appClient;
  } catch (error) {
    console.error("\n✗ Error en la inicialización:", error.message);
    process.exit(1);
  }
}

// Función para cerrar la conexión
async function closeConnection() {
  if (appClient) {
    await appClient.end();
    console.log("Conexión a la base de datos cerrada");
  }
}

// Exportar funciones
const getClient = () => appClient;

export { initializeDatabase, closeConnection, getClient };
