import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import teamReducer from './slices/teamSlice';
import groupReducer from './slices/groupSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamReducer,
    groups: groupReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
