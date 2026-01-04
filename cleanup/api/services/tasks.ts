import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { Task, CreateTaskRequest, UpdateTaskRequest, PaginatedResponse } from '../types';

export interface TaskFilters {
  teamId?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  date?: string;
  assigneeId?: string;
}

export const taskService = {
  /**
   * Get all tasks with optional filters
   */
  getAll: (filters?: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    
    const query = params.toString();
    return apiClient.get<Task[]>(`${ENDPOINTS.TASKS.LIST}${query ? `?${query}` : ''}`);
  },

  /**
   * Get task by ID
   */
  getById: (id: string) =>
    apiClient.get<Task>(ENDPOINTS.TASKS.BY_ID(id)),

  /**
   * Get tasks by team
   */
  getByTeam: (teamId: string) =>
    apiClient.get<Task[]>(ENDPOINTS.TASKS.BY_TEAM(teamId)),

  /**
   * Create a new task
   */
  create: (data: CreateTaskRequest) =>
    apiClient.post<Task>(ENDPOINTS.TASKS.CREATE, data),

  /**
   * Update task
   */
  update: (id: string, data: UpdateTaskRequest) =>
    apiClient.patch<Task>(ENDPOINTS.TASKS.BY_ID(id), data),

  /**
   * Delete task
   */
  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.TASKS.BY_ID(id)),

  /**
   * Assign task to users
   */
  assign: (id: string, assigneeIds: string[]) =>
    apiClient.post<Task>(ENDPOINTS.TASKS.ASSIGN(id), { assigneeIds }),

  /**
   * Mark task as complete
   */
  complete: (id: string) =>
    apiClient.post<Task>(ENDPOINTS.TASKS.COMPLETE(id)),
};
