import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { User, GroupMembersResponse } from '../types';

export interface UpdateUserRequest {
  name?: string;
  lastname?: string;
  avatar?: string;
}

export const userService = {
  /**
   * Get current user profile
   */
  getMe: () =>
    apiClient.get<User>(ENDPOINTS.USERS.ME),

  /**
   * Update current user profile
   */
  updateMe: (data: UpdateUserRequest) =>
    apiClient.patch<User>(ENDPOINTS.USERS.UPDATE, data),

  /**
   * Get user by ID
   */
  getById: (id: string) =>
    apiClient.get<User>(ENDPOINTS.USERS.BY_ID(id)),

  /**
   * Get all users in a group
   */
  getByGroup: (groupId: string) =>
    apiClient.get<GroupMembersResponse>(ENDPOINTS.USERS.BY_GROUP(groupId)),
};
