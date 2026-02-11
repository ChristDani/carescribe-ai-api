import { Router } from 'express'
import * as noteController from './note.controller.js'
import multer from 'multer';

const upload = multer({ dest: "src/public/audios/" });

const NoteRouter = Router()

NoteRouter.post('/getNotes', noteController.getNotes)
NoteRouter.get('/getNotes/:id', noteController.getNoteById)
NoteRouter.post('/setNotes', upload.single('nt_audio'), noteController.createNote)

export default NoteRouter
