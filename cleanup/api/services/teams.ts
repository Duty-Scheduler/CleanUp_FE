import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { CreateTeamRequest, JoinTeamRequest, Team, TeamMember } from '../types';

export const teamService = {
  /**
   * Get all teams for current user
   */
  getAll: () =>
    apiClient.get<Team[]>(ENDPOINTS.TEAMS.LIST),

  /**
   * Get team by ID
   */
  getById: (id: string) =>
    apiClient.get<Team>(ENDPOINTS.TEAMS.BY_ID(id)),

  /**
   * Create a new team
   */
  create: (data: CreateTeamRequest) =>
    apiClient.post<Team>(ENDPOINTS.TEAMS.CREATE, data),

  /**
   * Update team
   */
  update: (id: string, data: Partial<CreateTeamRequest>) =>
    apiClient.patch<Team>(ENDPOINTS.TEAMS.BY_ID(id), data),

  /**
   * Delete team
   */
  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.TEAMS.BY_ID(id)),

  /**
   * Join a team with code
   */
  join: (data: JoinTeamRequest) =>
    apiClient.post<Team>(ENDPOINTS.TEAMS.JOIN, data),

  /**
   * Leave a team
   */
  leave: (id: string) =>
    apiClient.post<void>(ENDPOINTS.TEAMS.LEAVE(id)),

  /**
   * Get team members
   */
  getMembers: (id: string) =>
    apiClient.get<TeamMember[]>(ENDPOINTS.TEAMS.MEMBERS(id)),
};
