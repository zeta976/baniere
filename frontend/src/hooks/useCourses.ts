import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '../services/api';

export function useCourseSearch(query: string) {
  return useQuery({
    queryKey: ['courses', 'search', query],
    queryFn: () => coursesApi.search(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000
  });
}

export function useCourseSections(courseCode: string) {
  return useQuery({
    queryKey: ['courses', 'sections', courseCode],
    queryFn: () => coursesApi.getSections(courseCode),
    enabled: !!courseCode,
    staleTime: 5 * 60 * 1000
  });
}

export function useCourses(filters?: {
  term?: string;
  subject?: string;
  openOnly?: boolean;
}) {
  return useQuery({
    queryKey: ['courses', 'all', filters],
    queryFn: () => coursesApi.getAll(filters),
    staleTime: 10 * 60 * 1000
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ['courses', 'subjects'],
    queryFn: () => coursesApi.getSubjects(),
    staleTime: 30 * 60 * 1000
  });
}
