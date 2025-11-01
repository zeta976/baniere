/**
 * API client for backend communication
 */

import axios from 'axios';
import { Course, CourseSearchResult } from '../types/course';
import { GenerateScheduleRequest, GenerateScheduleResponse } from '../types/schedule';

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

export const coursesApi = {
  /**
   * Search courses by code or title
   */
  search: async (query: string): Promise<CourseSearchResult[]> => {
    const response = await api.get<{ success: boolean; data: CourseSearchResult[] }>(
      `/courses/search`,
      { params: { q: query } }
    );
    return response.data.data;
  },

  /**
   * Get all sections for a course code
   */
  getSections: async (courseCode: string): Promise<Course[]> => {
    const response = await api.get<{ success: boolean; data: Course[] }>(
      `/courses/${courseCode}`
    );
    return response.data.data;
  },

  /**
   * Get all courses
   */
  getAll: async (filters?: {
    term?: string;
    subject?: string;
    openOnly?: boolean;
  }): Promise<Course[]> => {
    const response = await api.get<{ success: boolean; data: Course[] }>('/courses', {
      params: filters
    });
    return response.data.data;
  },

  /**
   * Get list of subjects
   */
  getSubjects: async (): Promise<string[]> => {
    const response = await api.get<{ success: boolean; data: string[] }>(
      '/courses/subjects/list'
    );
    return response.data.data;
  }
};

export const schedulesApi = {
  /**
   * Generate schedules
   */
  generate: async (request: GenerateScheduleRequest): Promise<GenerateScheduleResponse> => {
    const response = await api.post<GenerateScheduleResponse>('/schedules/generate', request);
    return response.data;
  }
};

export default api;
