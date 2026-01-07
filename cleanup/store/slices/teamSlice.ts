import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamService, Team, CreateTeamRequest, JoinTeamRequest } from '@/api';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  isLoading: false,
  error: null,
};

// Fetch all teams
export const fetchTeams = createAsyncThunk(
  'teams/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await teamService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch teams');
    }
  }
);

// Create team
export const createTeam = createAsyncThunk(
  'teams/create',
  async (data: CreateTeamRequest, { rejectWithValue }) => {
    try {
      return await teamService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create team');
    }
  }
);

// Join team
export const joinTeam = createAsyncThunk(
  'teams/join',
  async (data: JoinTeamRequest, { rejectWithValue }) => {
    try {
      return await teamService.join(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to join team');
    }
  }
);

// Leave team
export const leaveTeam = createAsyncThunk(
  'teams/leave',
  async (teamId: string, { rejectWithValue }) => {
    try {
      await teamService.leave(teamId);
      return teamId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to leave team');
    }
  }
);

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams.push(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Join team
      .addCase(joinTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams.push(action.payload);
      })
      .addCase(joinTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Leave team
      .addCase(leaveTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;
