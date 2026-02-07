import express from "express";
import { initializeDatabase, closeConnection, getClient } from "./config/db.js";
import { env } from "process";

const app = express();
const PORT = env.PORT || 3000;

// Middleware
app.use(express.json());

// Inicializar la base de datos al arrancar la aplicación
let isDbInitialized = false;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor funcionando" });
});

app.get("/api/patients", async (req, res) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }

    const result = await client.query("SELECT * FROM patient");
    res.json({
      data: result.rows,
      success: true,
      message: "Pacientes obtenidos exitosamente",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar el cierre gracioso
process.on("SIGINT", async () => {
  console.log("\nCerrando aplicación...");
  await closeConnection();
  process.exit(0);
});

// Iniciar servidor
async function startServer() {
  try {
    if (!isDbInitialized) {
      await initializeDatabase();
      isDbInitialized = true;
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();

export default app;
