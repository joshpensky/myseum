import { Fragment } from 'react';
import type { AppProps as BaseAppProps } from 'next/app';
import { IdProvider } from '@radix-ui/react-id';
import deepmerge from 'deepmerge';
import { Toaster } from '@src/components/Toaster';
import { GlobalLayout } from '@src/layouts/GlobalLayout';
import { AuthProvider } from '@src/providers/AuthProvider';
import StyleProvider from '@src/providers/StyleProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import { PageComponent } from '@src/types';
import '@src/styles/index.scss';

interface AppProps extends BaseAppProps {
  Component: PageComponent;
}

const App = ({ Component, pageProps }: AppProps) => {
  const PageLayout = Component.layout ?? Fragment;

  const pageLayoutProps = Component.getPageLayoutProps?.(pageProps) ?? {};

  let globalLayoutProps = Component.getGlobalLayoutProps?.(pageProps) ?? {};
  if (typeof PageLayout !== 'symbol' && PageLayout && 'getGlobalLayoutProps' in PageLayout) {
    // Get the global layout props defined by the page layout
    const globalLayoutPropsFromPageLayout =
      PageLayout.getGlobalLayoutProps?.(pageLayoutProps) ?? {};
    // Then merge the two definitions
    globalLayoutProps = deepmerge(globalLayoutPropsFromPageLayout, globalLayoutProps, {
      clone: true,
    });
  }

  return (
    <IdProvider>
      <ThemeProvider theme={{ color: 'paper' }}>
        <AuthProvider
          initUser={pageProps.__supabaseUser ?? null}
          initUserData={pageProps.__userData ?? null}>
          <StyleProvider>
            <GlobalLayout {...globalLayoutProps}>
              <PageLayout {...pageLayoutProps}>
                <Component {...pageProps} />
              </PageLayout>
            </GlobalLayout>

            <Toaster />
          </StyleProvider>
        </AuthProvider>
      </ThemeProvider>
    </IdProvider>
  );
};

export default App;
