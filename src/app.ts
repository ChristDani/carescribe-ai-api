import cors from "cors";
import express from "express";
import morgan from "morgan";

// import { errorHandler } from './middlewares/error.middleware';
import NoteRouter from "./modules/notes/note.routes.js";
import PatientRouter from "./modules/patients/patient.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * Middlewares globales
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/**
 * Rutas
 */
app.use("/api/patients", PatientRouter);
app.use("/api/notes", NoteRouter);
app.get("/api/audios/:filename", (req, res) => {
  const filePath = path.join(
    __dirname,
    "public",
    "audios",
    req.params.filename,
  );
  res.sendFile(filePath);
});

/**
 * Health check (útil para Docker / AWS)
 */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

/**
 * Middleware de manejo de errores (SIEMPRE al final)
 */
app.use(errorHandler);

export default app;
