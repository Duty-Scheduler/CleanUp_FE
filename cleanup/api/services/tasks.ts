import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { MyTasksResponse, MyTasksByDateResponse, GroupTasksResponse, CreateTaskRequest, UpdateTaskRequest, TaskDetailResponse } from '../types';

export const taskService = {
  /**
   * Get all tasks assigned to the current user
   */
  getMyTasks: () =>
    apiClient.get<MyTasksResponse>(ENDPOINTS.TASKS.MY_TASKS),

  /**
   * Get current user's tasks by specific date
   * @param date - Date in format YYYY-MM-DD
   */
  getMyTasksByDate: (date: string) =>
    apiClient.get<MyTasksByDateResponse>(`${ENDPOINTS.TASKS.MY_TASKS_BY_DATE}?date=${date}`),

  /**
   * Get all tasks in a group
   */
  getByGroup: (groupId: string) =>
    apiClient.get<GroupTasksResponse>(ENDPOINTS.TASKS.BY_GROUP(groupId)),

  /**
   * Get task detail by ID in a group
   */
  getTaskDetail: (groupId: string, taskId: string) =>
    apiClient.get<TaskDetailResponse>(ENDPOINTS.TASKS.DETAIL(groupId, taskId)),

  /**
   * Create a new task in a group (admin only)
   */
  create: (groupId: string, data: CreateTaskRequest) =>
    apiClient.post<any>(ENDPOINTS.TASKS.CREATE(groupId), data),

  /**
   * Update a task (admin only)
   */
  update: (taskId: string, data: UpdateTaskRequest) =>
    apiClient.put<any>(ENDPOINTS.TASKS.UPDATE(taskId), data),

  /**
   * Delete a task (admin only)
   */
  delete: (taskId: string) =>
    apiClient.delete<{ message: string }>(ENDPOINTS.TASKS.DELETE(taskId)),

  /**
   * Upload proof image for a task
   */
  uploadProof: (taskId: string, formData: FormData) =>
    apiClient.post<any>(ENDPOINTS.TASKS.UPLOAD_PROOF(taskId), formData),

  /**
   * Get tasks in a group by specific date
   */
  getByDate: (groupId: string, date: string) =>
    apiClient.get<any>(`${ENDPOINTS.TASKS.BY_DATE(groupId)}?date=${date}`),
};
