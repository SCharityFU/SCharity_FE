import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/store/features/auth/authSlice';
import { authApi } from '@/lib/store/features/auth/authApi';
import { reportApi } from '@/lib/store/features/report/reportApi';
import { homeApi } from '@/lib/store/features/home/homeApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [reportApi.reducerPath]: reportApi.reducer,
      [homeApi.reducerPath]: homeApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware, reportApi.middleware, homeApi.middleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
