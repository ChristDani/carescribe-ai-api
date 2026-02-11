import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const processAndTranscribe = async (audioFile: any) => {
  try {
    const fileName = `${Date.now()}-${audioFile.originalname}`;
    const filePath = path.join("src", "public", "audios", fileName);

    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });

    if (audioFile?.buffer) {
      await fsPromises.writeFile(filePath, audioFile.buffer);
    } else if (audioFile?.data) {
      await fsPromises.writeFile(filePath, audioFile.data);
    } else if (audioFile?.path) {
      await fsPromises.copyFile(audioFile.path, filePath);
    } else {
      throw new Error("Invalid audio file payload: no buffer or path provided");
    }

    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      language: "es",
    });

    const audioUrl = `/audios/${fileName}`;

    return {
      data: {
        text: transcription.text,
        audioUrl: audioUrl,
      },
      success: true,
      message: "Audio procesado y transcrito exitosamente",
    };
  } catch (error: any) {
    return {
      data: null,
      success: false,
      message: `Error al procesar el audio: ${error.message}`,
    };
  }
};

export const summarizeText = async (text: string) => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que resume textos de manera concisa y clara.",
        },
        {
          role: "user",
          content: `Por favor, resume y estructura el siguiente texto en un formato SOAP:\n\n${text}`,
        },
      ],
    });
    return {
      data: response?.choices[0]?.message?.content,
      success: true,
      message: "Texto estructurado exitosamente",
    };
  } catch (error: any) {
    return {
      data: null,
      success: false,
      message: `Error al estructurar el texto: ${error.message}`,
    };
  }
};
