import React, { Fragment } from 'react';
import { BrowserRouter, useRouteMatch, Link, Route, Switch } from 'react-router-dom';
import { SWRConfig } from 'swr';
import Layout from '@src/components/Layout';
import Portal from '@src/components/Portal';
import About from '@src/pages/About';
import Gallery from '@src/pages/Gallery';
import Home from '@src/pages/Home';
import Museum from '@src/pages/Museum';
import NotFound from '@src/pages/NotFound';
import useMuseum from '@src/hooks/useMuseum';

const MuseumRoutes = () => {
  const { path, params } = useRouteMatch();

  const { museum, isLoading, error } = useMuseum(params.museumId);

  if (isLoading) {
    return <p>Loading...</p>;
  } else if (error) {
    return <NotFound />;
  }

  return (
    <Fragment>
      <Portal to="nav-center" prepend>
        <Link to={`/museum/${museum.id}`}>
          <h1>{museum.name}</h1>
        </Link>
      </Portal>
      <Portal to="nav-right" className="no-replace" prepend>
        <button>Log in</button>
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
  <SWRConfig value={{ fetcher: (...args) => fetch(...args).then(res => res.json()) }}>
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/museum/:museumId" component={MuseumRoutes} />
          <Route path="*" component={NotFound} />
        </Switch>
      </Layout>
    </BrowserRouter>
  </SWRConfig>
);

export default App;
