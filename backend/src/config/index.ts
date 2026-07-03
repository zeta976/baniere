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
    : ['http://localhost:5173', 'https://baniere.vercel.app'],

  // Live "oferta de cursos" API (real-time course availability)
  useLiveApi: process.env.USE_LIVE_API !== 'false', // enabled by default
  courseApiUrl: process.env.COURSE_API_URL || 'https://ofertadecursos.uniandes.edu.co/api/courses',
  term: process.env.TERM || '202620',
  // How long the full course list (used for search/listing) stays cached, in ms
  coursesCacheTtlMs: parseInt(process.env.COURSES_CACHE_TTL_MS || '600000', 10) // 10 min
};
