import type { AppProps as BaseAppProps } from 'next/app';
import { IdProvider } from '@radix-ui/react-id';
import axios from 'axios';
import { SWRConfig } from 'swr';
import { Toaster } from '@src/components/Toaster';
import { GlobalLayout } from '@src/layouts/GlobalLayout';
import { AuthProvider } from '@src/providers/AuthProvider';
import StyleProvider from '@src/providers/StyleProvider';
import { PageComponent } from '@src/types';
import '@src/styles/index.scss';

interface AppProps extends BaseAppProps {
  Component: PageComponent;
}

const useDefaultComputedProps = () => ({ global: {}, page: {} });

const App = ({ Component, pageProps }: AppProps) => {
  const computedProps = (Component.useComputedProps ?? useDefaultComputedProps)(pageProps);

  return (
    <SWRConfig
      value={{
        fetcher: async url => {
          const res = await axios.get(url);
          return res.data;
        },
      }}>
      <IdProvider>
        <AuthProvider
          initValue={{
            supabaseUser: pageProps.__supabaseUser ?? null,
            userData: pageProps.__userData ?? null,
          }}>
          <StyleProvider>
            <GlobalLayout {...computedProps.global}>
              <Component {...pageProps} {...computedProps.page} />
            </GlobalLayout>

            <Toaster />
          </StyleProvider>
        </AuthProvider>
      </IdProvider>
    </SWRConfig>
  );
};

export default App;
