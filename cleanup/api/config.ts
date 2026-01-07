// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://cleanupapi-nyxe.onrender.com/api/v1',
  TIMEOUT: 30000,
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    GOOGLE: '/auth/google',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  // Users
  USERS: {
    ME: '/users/me',
    UPDATE: '/users/me',
    BY_ID: (id: string) => `/users/${id}`,
    BY_GROUP: (groupId: string) => `/user/group/${groupId}`,
  },
  // Groups
  GROUPS: {
    CREATE: '/group',
    JOINED: '/group/joined',
    JOIN: '/group/join',
    LEAVE: (groupId: string) => `/group/${groupId}/leave`,
    DELETE: (groupId: string) => `/group/${groupId}`,
    INVITE: (groupId: string) => `/group/${groupId}/invite`,
    REMOVE_MEMBER: (groupId: string, userId: string) => `/group/${groupId}/member/${userId}`,
  },
  // Teams (legacy)
  TEAMS: {
    LIST: '/group/joined',
    CREATE: '/group',
    BY_ID: (id: string) => `/group/${id}`,
    JOIN: '/group/join',
    LEAVE: (id: string) => `/group/${id}/leave`,
    MEMBERS: (id: string) => `user/group/${id}`,
  },
  // Tasks
  TASKS: {
    LIST: '/tasks',
    CREATE: (groupId: string) => `/task/group/${groupId}`,
    BY_ID: (id: string) => `/tasks/${id}`,
    BY_TEAM: (teamId: string) => `/teams/${teamId}/tasks`,
    ASSIGN: (id: string) => `/tasks/${id}/assign`,
    COMPLETE: (id: string) => `/tasks/${id}/complete`,
  },
  // Schedules
  SCHEDULES: {
    LIST: '/schedules',
    CREATE: '/schedules',
    BY_ID: (id: string) => `/schedules/${id}`,
    BY_DATE: (date: string) => `/schedules/date/${date}`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};
