/**
 * Schedule generation API routes
 * POST /api/schedules/generate - Generate all possible schedules
 */

import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import { BannerResponse } from '../../models/Course';
import { ScheduleGenerationRequest } from '../../models/Schedule';
import { normalizeCourses } from '../../services/normalizer';
import { groupSectionsByCourse } from '../../services/filterEngine';
import { generateSchedules } from '../../services/generator';
import { validateScheduleRequest } from '../middleware/validation';
import { config } from '../../config';

const router = Router();

async function loadCourses(): Promise<BannerResponse> {
  const data = await fs.readFile(config.coursesJsonPath, 'utf-8');
  return JSON.parse(data) as BannerResponse;
}

/**
 * POST /api/schedules/generate
 * Generate all possible schedules for given courses and filters
 */
router.post('/generate', validateScheduleRequest, async (req: Request, res: Response) => {
  try {
    const request = req.body as ScheduleGenerationRequest;
    const { courses, filters, maxResults = 500 } = request;
    
    console.log(`\n🔄 Generating schedules for: ${courses.join(', ')}`);
    console.log(`📋 Filters received:`, JSON.stringify(filters, null, 2));
    
    // Load all courses
    const bannerData = await loadCourses();
    const allNormalized = normalizeCourses(bannerData.data);
    
    // Get sections for requested courses
    const grouped = groupSectionsByCourse(allNormalized);
    const courseSections = new Map();
    
    for (const courseCode of courses) {
      const sections = grouped.get(courseCode.toUpperCase());
      
      if (!sections || sections.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Course ${courseCode} not found or has no sections`
        });
      }
      
      courseSections.set(courseCode.toUpperCase(), sections);
    }
    
    // Generate schedules
    const result = generateSchedules(courseSections, filters, maxResults);
    
    console.log(`Generated ${result.totalFound} schedules in ${result.searchTimeMs}ms`);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error generating schedules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate schedules',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
