import type { Request, Response } from "express";
import { processAndTranscribe, summarizeText } from "./ai.service.js";

export const getTranscription = async (req: Request, res: Response) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Procesar y transcribir el archivo de audio
    const transcription = await processAndTranscribe(audioFile);

    res.json({
      success: true,
      message: "Transcripción obtenida",
      data: transcription,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Error al procesar el archivo de audio", details: error.message});
  }
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Resumir el texto
    const summary = await summarizeText(text);

    res.json({
      success: true,
      message: "Resumen obtenido",
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Error al resumir el texto", details: error.message});
  }
};
