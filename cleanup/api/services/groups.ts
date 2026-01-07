import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { Group, GroupWithAdmin, CreateGroupRequest, JoinGroupRequest, InviteTokenResponse } from '../types';

export const groupService = {
  /**
   * Create a new group
   */
  create: (data: CreateGroupRequest) =>
    apiClient.post<GroupWithAdmin>(ENDPOINTS.GROUPS.CREATE, data),

  /**
   * Get all groups that the user has joined
   */
  getJoined: () =>
    apiClient.get<{ groups: Group[] }>(ENDPOINTS.GROUPS.JOINED),

  /**
   * Join a group using invite token
   */
  join: (data: JoinGroupRequest) =>
    apiClient.post<{ message: string }>(ENDPOINTS.GROUPS.JOIN, data),

  /**
   * Leave a group
   */
  leave: (groupId: string) =>
    apiClient.delete<{ message: string }>(ENDPOINTS.GROUPS.LEAVE(groupId)),

  /**
   * Delete a group (admin only)
   */
  delete: (groupId: string) =>
    apiClient.delete<{ message: string }>(ENDPOINTS.GROUPS.DELETE(groupId)),

  /**
   * Create invite token for a group (admin only)
   */
  createInvite: (groupId: string) =>
    apiClient.post<InviteTokenResponse>(ENDPOINTS.GROUPS.INVITE(groupId)),

  /**
   * Remove a member from a group (admin only)
   */
  removeMember: (groupId: string, userId: string) =>
    apiClient.delete<{ message: string }>(ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, userId)),
};
