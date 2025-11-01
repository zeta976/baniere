/**
 * Request validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import { validateFilters } from '../../utils/validation';
import { ScheduleGenerationRequest } from '../../models/Schedule';

export function validateScheduleRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as ScheduleGenerationRequest;
  
  if (!body.courses || !Array.isArray(body.courses) || body.courses.length === 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid request: courses array is required and must not be empty'
    });
    return;
  }
  
  if (body.courses.length > 10) {
    res.status(400).json({
      success: false,
      error: 'Too many courses: maximum 10 courses allowed'
    });
    return;
  }
  
  if (body.filters) {
    const validation = validateFilters(body.filters);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid filters',
        details: validation.errors
      });
      return;
    }
  }
  
  next();
}
