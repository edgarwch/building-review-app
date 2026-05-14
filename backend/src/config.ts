import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/review_app',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  storageBackend: (process.env.STORAGE_BACKEND || 'local') as 'local' | 's3',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    bucket: process.env.S3_BUCKET || '',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
  },
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};
