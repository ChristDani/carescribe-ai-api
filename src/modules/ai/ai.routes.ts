import { Router } from "express";
import { getSummary, getTranscription } from "./ai.controller.js";
import multer from "multer";

const upload = multer({ dest: "src/public/audios/" });

const AiRouter = Router();

AiRouter.post("/transcription", upload.single("file"), getTranscription);
AiRouter.post("/summary", getSummary);

export default AiRouter;
