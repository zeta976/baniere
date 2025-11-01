/**
 * Application configuration
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  coursesJsonPath: process.env.COURSES_JSON_PATH || path.join(__dirname, '../../../courses.json'),
  corsOrigin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'https://baniere.vercel.app']
};
