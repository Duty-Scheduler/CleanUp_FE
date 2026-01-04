import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { Schedule, Task } from '../types';

export interface CreateScheduleRequest {
  date: string;
  taskIds?: string[];
  teamId?: string;
}

export const scheduleService = {
  /**
   * Get all schedules
   */
  getAll: () =>
    apiClient.get<Schedule[]>(ENDPOINTS.SCHEDULES.LIST),

  /**
   * Get schedule by ID
   */
  getById: (id: string) =>
    apiClient.get<Schedule>(ENDPOINTS.SCHEDULES.BY_ID(id)),

  /**
   * Get schedule by date (format: YYYY-MM-DD)
   */
  getByDate: (date: string) =>
    apiClient.get<Schedule>(ENDPOINTS.SCHEDULES.BY_DATE(date)),

  /**
   * Create a new schedule
   */
  create: (data: CreateScheduleRequest) =>
    apiClient.post<Schedule>(ENDPOINTS.SCHEDULES.CREATE, data),

  /**
   * Update schedule
   */
  update: (id: string, data: Partial<CreateScheduleRequest>) =>
    apiClient.patch<Schedule>(ENDPOINTS.SCHEDULES.BY_ID(id), data),

  /**
   * Delete schedule
   */
  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.SCHEDULES.BY_ID(id)),
};
