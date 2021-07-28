import { ComponentType } from 'react';
import type { AppProps as BaseAppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import Layout, { SubLayoutProps } from '@src/components/Layout';
import { AuthProvider } from '@src/providers/AuthProvider';
import StyleProvider from '@src/providers/StyleProvider';
import '@src/global.css';

interface AppProps extends BaseAppProps {
  Component: BaseAppProps['Component'] & {
    Layout?: ComponentType<SubLayoutProps>;
  };
}

const App = ({ Component, pageProps }: AppProps) => {
  const AppLayout = Component.Layout ?? Layout;

  return (
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
  );
};

export default App;
