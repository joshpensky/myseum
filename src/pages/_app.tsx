import type { AppProps as BaseAppProps } from 'next/app';
import { GetLayoutFunction, getDefaultLayout } from '@src/components/Layout';
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
    <StyleProvider>
      {getLayout(<Component {...pageProps} />, pageProps)}
      <div id="modal-root" />
    </StyleProvider>
  );
};

export default App;
