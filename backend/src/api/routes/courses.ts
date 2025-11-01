/**
 * Courses API routes
 * GET /api/courses - List all courses
 * GET /api/courses/search - Search courses by code or name
 * GET /api/courses/:code - Get sections for a specific course code
 */

import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { BannerResponse } from '../../models/Course';
import { normalizeCourses } from '../../services/normalizer';
import { groupSectionsByCourse } from '../../services/filterEngine';
import { config } from '../../config';

const router = Router();

// In-memory cache for courses (would use Redis in production)
let coursesCache: BannerResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function loadCourses(): Promise<BannerResponse> {
  const now = Date.now();
  
  // Return cached data if fresh
  if (coursesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return coursesCache;
  }
  
  // Load from file
  const data = await fs.readFile(config.coursesJsonPath, 'utf-8');
  coursesCache = JSON.parse(data) as BannerResponse;
  cacheTimestamp = now;
  
  return coursesCache;
}

/**
 * GET /api/courses
 * Returns all courses (normalized)
 * Query params: term, subject, openOnly
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const bannerData = await loadCourses();
    let courses = bannerData.data;
    
    // Apply filters
    const { term, subject, openOnly } = req.query;
    
    if (term) {
      courses = courses.filter(c => c.term === term);
    }
    
    if (subject) {
      courses = courses.filter(c => c.subject === subject);
    }
    
    if (openOnly === 'true') {
      courses = courses.filter(c => c.openSection);
    }
    
    const normalized = normalizeCourses(courses);
    
    res.json({
      success: true,
      totalCount: normalized.length,
      data: normalized
    });
  } catch (error) {
    console.error('Error loading courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load courses'
    });
  }
});

/**
 * GET /api/courses/search
 * Search courses by code or title
 * Query params: q (query string)
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toUpperCase().trim();
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" must be at least 2 characters'
      });
    }
    
    const bannerData = await loadCourses();
    
    // Search by subjectCourse or title
    const matches = bannerData.data.filter(course =>
      course.subjectCourse.includes(query) ||
      course.courseTitle.toUpperCase().includes(query)
    );
    
    const normalized = normalizeCourses(matches);
    
    // Group by subjectCourse and return unique courses with section counts
    const grouped = groupSectionsByCourse(normalized);
    const results = Array.from(grouped.entries()).map(([code, sections]) => ({
      subjectCourse: code,
      courseTitle: sections[0].courseTitle,
      subject: sections[0].subject,
      courseNumber: sections[0].courseNumber,
      creditHours: sections[0].creditHours,
      sectionCount: sections.length,
      openSections: sections.filter(s => s.openSection).length,
      sections: sections.slice(0, 5) // Return first 5 sections as preview
    }));
    
    res.json({
      success: true,
      totalCount: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

/**
 * GET /api/courses/:code
 * Get all sections for a specific course code
 */
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    const bannerData = await loadCourses();
    
    const sections = bannerData.data.filter(c => c.subjectCourse === code);
    
    if (sections.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Course ${code} not found`
      });
    }
    
    const normalized = normalizeCourses(sections);
    
    res.json({
      success: true,
      totalCount: normalized.length,
      data: normalized
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course'
    });
  }
});

/**
 * GET /api/courses/subjects/list
 * Get list of unique subjects
 */
router.get('/subjects/list', async (req: Request, res: Response) => {
  try {
    const bannerData = await loadCourses();
    
    const subjects = new Set(bannerData.data.map(c => c.subject));
    const subjectList = Array.from(subjects).sort();
    
    res.json({
      success: true,
      totalCount: subjectList.length,
      data: subjectList
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects'
    });
  }
});

export default router;
