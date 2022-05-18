import type { AppProps as BaseAppProps } from 'next/app';
import { IdProvider } from '@radix-ui/react-id';
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
      <AuthProvider
        initValue={{
          supabaseUser: pageProps.__supabaseUser ?? null,
          userData: pageProps.__userData ?? null,
        }}>
        <GlobalLayout {...computedProps.global}>
          <Component {...pageProps} {...computedProps.page} />
        </GlobalLayout>

        <Toaster />
      </AuthProvider>
    </IdProvider>
  );
};

export default App;
