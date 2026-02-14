import 'dotenv/config';
import { connectDB } from './config/db.js';
import { seedPatients } from './seeds/patient.seed.js';
import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

async function bootstrap() {
  try {
    /**
     * Conexión a base de datos
     */
    // await createDatabaseIfNotExists()
    const db = await connectDB();
    console.log('✅ Database connected');

    /**
     * Seed inicial de pacientes
     * (solo si la tabla está vacía)
     */
    await seedPatients(db);

    /**
     * Levantar servidor
     */
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
