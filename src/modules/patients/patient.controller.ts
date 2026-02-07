import type { Request, Response } from "express";
import { getClient } from "../../config/db.js";

export const getPatients = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }

    const result = await client.query("SELECT * FROM patient WHERE pt_id = $1", [req.body.id]);
    res.json({
      data: result.rows,
      success: true,
      message: "Paciente obtenido exitosamente",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
    