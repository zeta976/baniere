/**
 * API client for backend communication
 */

import axios from 'axios';
import { Course, CourseSearchResult } from '../types/course';
import { GenerateScheduleRequest, GenerateScheduleResponse } from '../types/schedule';
import * as uniandesApi from './uniandesApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Course data is fetched directly from the Uniandes API in the browser.
 * Colombian IPs can reach it and it is CORS-enabled, so this works even when
 * the backend host (e.g. Render) is geo-blocked, and gives real-time seats.
 */
export const coursesApi = {
  /** Search courses by code or title */
  search: (query: string): Promise<CourseSearchResult[]> => uniandesApi.searchCourses(query),

  /** Get all sections for a course code */
  getSections: (courseCode: string): Promise<Course[]> => uniandesApi.getSections(courseCode),

  /** Get all courses */
  getAll: (filters?: { term?: string; subject?: string; openOnly?: boolean }): Promise<Course[]> =>
    uniandesApi.getAllCourses(filters),

  /** Get list of subjects */
  getSubjects: (): Promise<string[]> => uniandesApi.getSubjects()
};

export const schedulesApi = {
  /**
   * Generate schedules.
   * The browser fetches the selected courses' sections from the Uniandes API
   * (real-time seats) and posts them to the backend, which runs the schedule
   * generation engine on the provided data.
   */
  generate: async (request: GenerateScheduleRequest): Promise<GenerateScheduleResponse> => {
    const apiCourses = await uniandesApi.fetchRawSections(request.courses);
    const response = await api.post<GenerateScheduleResponse>('/schedules/generate', {
      ...request,
      apiCourses
    });
    return response.data;
  }
};

export default api;
