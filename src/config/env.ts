export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,

  // Database
  DB_NAME: process.env.DB_NAME || '',
  DB_USER: process.env.DB_USER || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_PORT: Number(process.env.DB_PORT) || 0,
  DB_HOST: process.env.DB_HOST || '',

  // OpenAI / IA
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // AWS (opcional)
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET || '',
};
