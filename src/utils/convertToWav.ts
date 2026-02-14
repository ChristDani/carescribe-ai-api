import path from "path";
import { execFile } from "child_process";

const FFMPEG_PATH =
  process.platform === "win32"
    ? path.resolve("src", "public", "ffmpeg", "win", "ffmpeg.exe")
    : path.resolve("src", "public", "ffmpeg", "linux", "ffmpeg");

export const convertToWav = (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const absoluteInput = path.resolve(inputPath);

    const outputPath = absoluteInput.replace(
      path.extname(absoluteInput),
      ".wav",
    );

    execFile(
      FFMPEG_PATH,
      ["-y", "-i", absoluteInput, "-ar", "16000", "-ac", "1", outputPath],
      (error) => {
        if (error) {
          console.error("FFmpeg error:", error);
          reject(new Error("Error al convertir audio"));
        } else {
          resolve(outputPath);
        }
      },
    );
  });
};
