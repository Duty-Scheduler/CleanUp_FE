import { CreateGroupRequest, Group, groupService, JoinGroupRequest } from '@/api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  inviteToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  currentGroup: null,
  inviteToken: null,
  isLoading: false,
  error: null,
};

// Fetch joined groups
export const fetchJoinedGroups = createAsyncThunk(
  'groups/fetchJoined',
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupService.getJoined();
      return response.groups;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch groups');
    }
  }
);

// Create a new group
export const createGroup = createAsyncThunk(
  'groups/create',
  async (data: CreateGroupRequest, { rejectWithValue }) => {
    try {
      const response = await groupService.create(data);
      // After creating, also create invite token
      const inviteResponse = await groupService.createInvite(response.group.id);
      return {
        group: { ...response.group, UserGroupTask: { isAdmin: response.isAdmin } },
        inviteToken: inviteResponse.inviteToken
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create group');
    }
  }
);

// Join a group
export const joinGroup = createAsyncThunk(
  'groups/join',
  async (data: JoinGroupRequest, { rejectWithValue }) => {
    try {
      await groupService.join(data);
      // Refetch groups after joining
      const response = await groupService.getJoined();
      return response.groups;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to join group');
    }
  }
);

// Leave a group
export const leaveGroup = createAsyncThunk(
  'groups/leave',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await groupService.leave(groupId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to leave group');
    }
  }
);

// Delete a group (admin only)
export const deleteGroup = createAsyncThunk(
  'groups/delete',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await groupService.delete(groupId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete group');
    }
  }
);

// Create invite token
export const createInviteToken = createAsyncThunk(
  'groups/createInvite',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await groupService.createInvite(groupId);
      return response.inviteToken;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create invite');
    }
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
    clearInviteToken: (state) => {
      state.inviteToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch joined groups
      .addCase(fetchJoinedGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJoinedGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchJoinedGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups.push(action.payload.group);
        state.currentGroup = action.payload.group;
        state.inviteToken = action.payload.inviteToken;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Join group
      .addCase(joinGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Leave group
      .addCase(leaveGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = state.groups.filter(g => g.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete group
      .addCase(deleteGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = state.groups.filter(g => g.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create invite token
      .addCase(createInviteToken.fulfilled, (state, action) => {
        state.inviteToken = action.payload;
      });
  },
});

export const { clearError, setCurrentGroup, clearInviteToken } = groupSlice.actions;
export default groupSlice.reducer;
