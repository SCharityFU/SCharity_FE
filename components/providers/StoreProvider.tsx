'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore, STORE_CONFIG_VERSION } from '@/lib/store/store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<{ store: AppStore; version: number } | undefined>(
    undefined,
  );

  if (!storeRef.current || storeRef.current.version !== STORE_CONFIG_VERSION) {
    storeRef.current = {
      store: makeStore(),
      version: STORE_CONFIG_VERSION,
    };
  }

  return <Provider store={storeRef.current.store}>{children}</Provider>;
}
