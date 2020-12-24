import { useRouteMatch, Link, Route, Switch } from 'react-router-dom';
import useSWR from 'swr';
import tw from 'twin.macro';
import Portal from '@src/components/Portal';
import MuseumAbout from '@src/pages/museum/MuseumAbout';
import MuseumGallery from '@src/pages/museum/MuseumGallery';
import MuseumHome from '@src/pages/museum/MuseumHome';
import NotFound from '@src/pages/NotFound';
import { MuseumProvider } from '@src/providers/MuseumProvider';
import { Museum } from '@src/types';

const MuseumRoot = () => {
  const { path, params } = useRouteMatch<{ museumId: string }>();

  const { data: museum, error } = useSWR<Museum>(() => `/api/museums/${params.museumId}`);

  if (error) {
    return <NotFound />;
  } else if (!museum) {
    return <p>Loading...</p>;
  }

  return (
    <MuseumProvider museum={museum}>
      <Portal to="nav-center" prepend>
        <Link css={tw`flex mt-1.5`} to={`/museum/${museum.id}`}>
          <h1 css={tw`font-serif leading-none text-3xl`}>{museum.name}</h1>
        </Link>
      </Portal>
      <Portal to="nav-right" className="no-replace" prepend>
        <button>Log in</button>
      </Portal>

      <Switch>
        <Route path={[path, `${path}/collection`]} exact component={MuseumHome} />
        <Route path={`${path}/about`} exact component={MuseumAbout} />
        <Route path={`${path}/gallery/:galleryId`} exact component={MuseumGallery} />
        <Route path={`${path}/*`} component={NotFound} />
      </Switch>
    </MuseumProvider>
  );
};

export default MuseumRoot;
