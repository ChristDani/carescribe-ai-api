import { Router } from 'express'
import * as noteController from './note.controller.js'

const NoteRouter = Router()

NoteRouter.post('/getNotes', noteController.getNotes)
NoteRouter.get('/getNotes/:id', noteController.getNoteById)
NoteRouter.post('/setNotes', noteController.createNote)

export default NoteRouter
