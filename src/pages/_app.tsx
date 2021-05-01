import type { AppProps as BaseAppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { GetLayoutFunction, getDefaultLayout } from '@src/components/Layout';
import { AuthProvider } from '@src/providers/AuthProvider';
import StyleProvider from '@src/providers/StyleProvider';
import '@src/global.css';

interface AppProps extends BaseAppProps {
  Component: BaseAppProps['Component'] & {
    getLayout?: GetLayoutFunction;
  };
}

const App = ({ Component, pageProps }: AppProps) => {
  const getLayout = Component.getLayout ?? getDefaultLayout;

  return (
    <AuthProvider>
      <StyleProvider>
        {getLayout(<Component {...pageProps} />, pageProps)}
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
