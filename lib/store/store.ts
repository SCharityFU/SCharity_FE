import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/store/features/auth/authSlice';
import { authApi } from '@/lib/store/features/auth/authApi';
import { adminApi } from '@/lib/store/features/admin/adminApi';
import { reportApi } from '@/lib/store/features/report/reportApi';
import { campaignApi } from '@/lib/store/features/campaign/campaignApi';
import { homeApi } from '@/lib/store/features/home/homeApi';
import { userApi } from '@/lib/store/features/user/userApi';
import { adminApi } from '@/lib/store/features/admin/adminApi';
import { donationApi } from '@/lib/store/features/donation/donationApi';

// Helps client StoreProvider detect hot-updated store config in development.
export const STORE_CONFIG_VERSION = Date.now();

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [reportApi.reducerPath]: reportApi.reducer,
      [campaignApi.reducerPath]: campaignApi.reducer,
      [homeApi.reducerPath]: homeApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [donationApi.reducerPath]: donationApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware, adminApi.middleware),
      getDefaultMiddleware().concat(
        authApi.middleware,
        reportApi.middleware,
        campaignApi.middleware,
        homeApi.middleware,
        userApi.middleware,
        adminApi.middleware,
        donationApi.middleware,
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
