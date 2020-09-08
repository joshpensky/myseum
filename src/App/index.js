import React, { Fragment } from 'react';
import { BrowserRouter, useRouteMatch, Link, Route, Switch } from 'react-router-dom';
import Layout from '@src/components/Layout';
import Portal from '@src/components/Portal';
import About from '@src/pages/About';
import Gallery from '@src/pages/Gallery';
import Home from '@src/pages/Home';
import Museum from '@src/pages/Museum';
import NotFound from '@src/pages/NotFound';

const MuseumRoutes = () => {
  const { path, params } = useRouteMatch();
  const museumId = params.museumId;

  return (
    <Fragment>
      <Portal to="nav-center" prepend>
        <Link to={`/museum/${museumId}`}>
          <h1>Museum Name</h1>
        </Link>
      </Portal>

      <Switch>
        <Route path={[path, `${path}/collection`]} exact component={Museum} />
        <Route path={`${path}/about`} exact component={About} />
        <Route path={`${path}/gallery/:galleryId`} exact component={Gallery} />
        <Route path={`${path}/*`} component={NotFound} />
      </Switch>
    </Fragment>
  );
};

const App = () => (
  <BrowserRouter>
    <Layout>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/museum/:museumId" component={MuseumRoutes} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Layout>
  </BrowserRouter>
);

export default App;
