import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Layout from '@src/components/Layout';
import AddArtwork from '@src/pages/AddArtwork';
import AddFrame from '@src/pages/AddFrame';
import Home from '@src/pages/Home';
import NotFound from '@src/pages/NotFound';
import StyleProvider from '@src/providers/StyleProvider';
import { SWRProvider } from '@src/providers/SWRProvider';
import MuseumRoot from '@src/roots/MuseumRoot';

const App = () => (
  <StyleProvider>
    <SWRProvider>
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/museum/:museumId" component={MuseumRoot} />
            <Route path="/add/artwork" component={AddArtwork} />
            <Route path="/add/frame" component={AddFrame} />
            <Route path="*" component={NotFound} />
          </Switch>
        </Layout>
      </BrowserRouter>
    </SWRProvider>
  </StyleProvider>
);

export default App;
