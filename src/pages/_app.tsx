import { ComponentType } from 'react';
import type { AppProps as BaseAppProps } from 'next/app';
import { IdProvider } from '@radix-ui/react-id';
import { Toaster } from 'react-hot-toast';
import Layout, { SubLayoutProps } from '@src/components/Layout';
import { AuthProvider } from '@src/providers/AuthProvider';
import StyleProvider from '@src/providers/StyleProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import '@src/styles/index.scss';

interface AppProps extends BaseAppProps {
  Component: BaseAppProps['Component'] & {
    Layout?: ComponentType<SubLayoutProps>;
  };
}

const App = ({ Component, pageProps }: AppProps) => {
  const AppLayout = Component.Layout ?? Layout;

  return (
    <IdProvider>
      <ThemeProvider theme={{ color: 'paper' }}>
        <AuthProvider>
          <StyleProvider>
            <AppLayout pageProps={pageProps}>
              <Component {...pageProps} />
            </AppLayout>
            <div id="modal-root" />

            {/* TODO: style the toasts */}
            <Toaster
              position="bottom-left"
              toastOptions={{
                duration: 6000,
                error: {
                  duration: 10000,
                },
              }}
            />
          </StyleProvider>
        </AuthProvider>
      </ThemeProvider>
    </IdProvider>
  );
};

export default App;
