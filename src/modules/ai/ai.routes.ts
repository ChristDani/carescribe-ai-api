import { Router } from 'express'
import { getSummary, getTranscription } from './ai.controller.js'

const AiRouter = Router()

AiRouter.post('/transcription', getTranscription)
AiRouter.post('/summary', getSummary)

export default AiRouter