import type { Request, Response } from "express";
import { getClient } from "../../config/db.js";

export const getNotes = async (req: Request, res: Response) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }
    let query = "SELECT * FROM notes";
    if (req.body.patientId) {
      query += ` WHERE nt_patient_id = '${req.body.patientId}'`;
    }
    query += " ORDER BY nt_created_at DESC";

    const result = await client.query(query);
    res.json({
      data: result.rows,
      success: true,
      message: "Notas obtenidas exitosamente",
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message, success: false, data: null });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Nota con ID: ${id}` });
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }
    const {
      nt_patient_id,
      nt_raw_input,
      nt_transcription,
      nt_ai_summary,
      nt_audio_url,
    } = req.body;

    const query = `INSERT INTO notes (nt_id, nt_patient_id, nt_raw_input, nt_transcription, nt_ai_summary, nt_audio_url)
                   VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING *`;

    const values = [
      nt_patient_id,
      nt_raw_input,
      nt_transcription,
      nt_ai_summary,
      nt_audio_url,
    ];

    const result = await client.query(query, values);
    
    res
      .status(201)
      .json({ message: "Nota creada", data: result.rows[0], success: true });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message, success: false, data: null });
  }
};
