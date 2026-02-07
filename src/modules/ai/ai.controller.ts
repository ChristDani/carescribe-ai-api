import type { Request, Response } from "express";
import { getClient } from "../../config/db.js";
import { processAndTranscribe } from "./ai.service.js";

export const getTranscription = async (req: Request, res: Response) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Procesar y transcribir el archivo de audio
    const transcription = await processAndTranscribe(audioFile);

    res.json({
      message: "Transcripción obtenida",
      transcription: transcription,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar el archivo de audio" });
  }
};

export const getSummary = async (req: Request, res: Response) => {
  res.json({ message: "Resumen obtenido" });
};
