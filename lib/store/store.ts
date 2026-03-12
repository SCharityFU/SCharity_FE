import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/store/features/auth/authSlice';
import { authApi } from '@/lib/store/features/auth/authApi';
import { reportApi } from '@/lib/store/features/report/reportApi';
import { campaignApi } from '@/lib/store/features/campaign/campaignApi';
import { homeApi } from '@/lib/store/features/home/homeApi';
import { userApi } from '@/lib/store/features/user/userApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [reportApi.reducerPath]: reportApi.reducer,
      [campaignApi.reducerPath]: campaignApi.reducer,
      [homeApi.reducerPath]: homeApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        reportApi.middleware,
        campaignApi.middleware,
        homeApi.middleware,
        userApi.middleware
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
