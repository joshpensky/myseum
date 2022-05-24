import type { AppProps as BaseAppProps } from 'next/app';
import { IdProvider } from '@radix-ui/react-id';
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs';
import { UserProvider } from '@supabase/supabase-auth-helpers/react';
import { Toaster } from '@src/components/Toaster';
import { GlobalLayout } from '@src/layouts/GlobalLayout';
import { AuthProvider } from '@src/providers/AuthProvider';
import { PageComponent } from '@src/types';
import '@src/styles/index.scss';

interface AppProps extends BaseAppProps {
  Component: PageComponent;
}

const useDefaultComputedProps = () => ({ global: {}, page: {} });

const App = ({ Component, pageProps }: AppProps) => {
  const computedProps = (Component.useComputedProps ?? useDefaultComputedProps)(pageProps);

  return (
    <IdProvider>
      <UserProvider supabaseClient={supabaseClient}>
        <AuthProvider initValue={pageProps.__authUser}>
          <GlobalLayout {...computedProps.global}>
            <Component {...pageProps} {...computedProps.page} />
          </GlobalLayout>

          <Toaster />
        </AuthProvider>
      </UserProvider>
    </IdProvider>
  );
};

export default App;
