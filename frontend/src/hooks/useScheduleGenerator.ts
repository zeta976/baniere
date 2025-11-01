import { useMutation } from '@tanstack/react-query';
import { schedulesApi } from '../services/api';
import { GenerateScheduleRequest } from '../types/schedule';

export function useScheduleGenerator() {
  return useMutation({
    mutationFn: async (request: GenerateScheduleRequest) => {
      console.log('📡 Sending request to backend:', {
        courses: request.courses,
        filterCount: Object.keys(request.filters).length,
        filters: request.filters
      });
      return schedulesApi.generate(request);
    },
    onSuccess: (data) => {
      console.log(`✅ Generated ${data.totalFound} schedules in ${data.searchTimeMs}ms`);
    },
    onError: (error) => {
      console.error('❌ Schedule generation failed:', error);
    },
    // Ensure React Query never caches mutation results
    gcTime: 0
  });
}
