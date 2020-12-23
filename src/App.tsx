import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Layout from '@src/components/Layout';
import { SWRProvider } from '@src/providers/SWRProvider';
import Home from '@src/pages/Home';
import NotFound from '@src/pages/NotFound';
import MuseumRoot from '@src/roots/MuseumRoot';
import StyleProvider from './providers/StyleProvider';

const App = () => (
  <StyleProvider>
    <SWRProvider>
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/museum/:museumId" component={MuseumRoot} />
            <Route path="*" component={NotFound} />
          </Switch>
        </Layout>
      </BrowserRouter>
    </SWRProvider>
  </StyleProvider>
);

export default App;
