import { Router } from 'express'
import * as patientController from './patient.controller.js'

const PatientRouter = Router()

PatientRouter.get('/getPatients', patientController.getPatients)
PatientRouter.post('/getPatient', patientController.getPatientById)

export default PatientRouter