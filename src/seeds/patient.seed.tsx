import { v4 as uuidv4 } from 'uuid';

export const seedPatients = async (db: any) => {
  try {
    const checkQuery = await db.query(
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
        await db.query(
          "INSERT INTO patient (pt_id, pt_first_name, pt_last_name, pt_dob, pt_gender) VALUES ($1, $2, $3, $4, $5)",
          [patient.pt_id, patient.pt_first_name, patient.pt_last_name, patient.pt_dob, patient.pt_gender],
        );
      }
    }
  } catch (error: any) {
    console.error("Error al insertar datos:", error.message);
    throw error;
  }
}
