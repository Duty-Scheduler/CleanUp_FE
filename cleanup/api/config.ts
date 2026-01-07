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
  },
  // Teams
  TEAMS: {
    LIST: '/teams',
    CREATE: '/teams',
    BY_ID: (id: string) => `/teams/${id}`,
    JOIN: '/teams/join',
    LEAVE: (id: string) => `/teams/${id}/leave`,
    MEMBERS: (id: string) => `/teams/${id}/members`,
  },
  // Tasks
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
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
