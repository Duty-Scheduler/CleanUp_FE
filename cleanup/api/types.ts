// Auth Types
export interface User {
  id: string;
  googleId?: string;
  email: string;
  name: string;
  lastname?: string;
  avatar?: string;
  provider?: 'google' | 'local';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: {
    googleId: string;
    email: string;
    name: string;
    lastname: string;
    avatar: string;
    provider: 'google';
  };
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  lastname: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Team Types (now Group)
export interface Group {
  id: string;
  title: string;
  description: string;
  UserGroupTask?: {
    isAdmin: boolean;
  };
}

export interface GroupMember {
  id: string;
  email: string;
  name: string;
  lastname: string;
  avatar: string;
  UserGroupTask: {
    isAdmin: boolean;
    penalty_status: boolean;
  };
}

export interface GroupMembersResponse {
  groupId: string;
  users: GroupMember[];
}

export interface GroupWithAdmin {
  group: Group;
  isAdmin: boolean;
}

export interface CreateGroupRequest {
  title: string;
  description: string;
}

export interface JoinGroupRequest {
  groupId: string;
  inviteToken: string;
}

export interface InviteTokenResponse {
  inviteToken: string;
  message: string;
}

// Legacy Team types (keep for compatibility)
export interface Team {
  id: string;
  name: string;
  description?: string;
  code: string;
  ownerId: string;
  memberCount: number;
  members?: TeamMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'owner' | 'admin' | 'member';
  user?: User;
  joinedAt?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface JoinTeamRequest {
  code: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  teamId: string;
  assigneeIds?: string[];
  assignees?: User[];
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  penalty_description: string;
  assignId?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  assigneeIds?: string[];
  dueDate?: string;
}

// Schedule Types
export interface Schedule {
  id: string;
  date: string;
  tasks: Task[];
  teamId?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'team_invite' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
