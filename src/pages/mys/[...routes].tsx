import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Gallery, Museum } from '@prisma/client';
import useSWR from 'swr';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/GalleryRepository';
import { MuseumRepository } from '@src/data/MuseumRepository';
import NotFound from '../404';

const getRoute = (routes: string[]) => {
  if (!routes.length) {
    return null;
  }

  const idSchema = z.number().int();
  const museumId = idSchema.safeParse(Number(routes[0]));

  if (!museumId.success) {
    return null;
  }

  if (routes.length === 1) {
    return {
      name: 'index' as const,
      museumId: museumId.data,
    };
  }

  if (routes.length === 2 && ['collection', 'about'].includes(routes[1])) {
    return {
      name: routes[1] === 'collection' ? ('collection' as const) : ('about' as const),
      museumId: museumId.data,
    };
  }

  const galleryId = idSchema.safeParse(Number(routes[2]));
  if (routes.length === 3 && routes[1] === 'gallery' && galleryId.success) {
    return {
      name: 'gallery' as const,
      museumId: museumId.data,
      galleryId: galleryId.data,
    };
  }

  return null;
};

type FullMuseum = Museum & { galleries: Gallery[] };

const GalleryPage = ({
  museum,
  galleryId,
  gallery,
}: {
  museum: FullMuseum;
  galleryId: number;
  gallery?: Gallery;
}) => {
  const gallerySwr = useSWR(
    gallery?.id === galleryId ? null : `/api/museum/${museum.id}/gallery/${galleryId}`,
  );

  let galleryData: Gallery;

  if (gallery?.id === galleryId) {
    galleryData = gallery;
  } else {
    if (gallerySwr.error) {
      return <NotFound />;
    } else if (!gallerySwr.data) {
      return <p>Loading...</p>;
    }
    galleryData = gallerySwr.data;
  }

  return (
    <div>
      <h1>{museum.name}</h1>
      <p>Gallery {galleryData.id}</p>
      <hr />
      <Link href={`/mys/${museum.id}`} shallow>
        <a>Map</a>
      </Link>
    </div>
  );
};

const About = ({ museum }: { museum: FullMuseum }) => (
  <div>
    <h1>{museum.name}</h1>
    <p>About</p>
    <hr />
    <Link href={`/mys/${museum.id}`} shallow>
      <a>Map</a>
    </Link>
  </div>
);

const Collection = ({ museum }: { museum: FullMuseum }) => (
  <div>
    <h1>{museum.name}</h1>
    <p>Collection</p>
    <hr />
    <Link href={`/mys/${museum.id}`} shallow>
      <a>Map</a>
    </Link>
    <Link href={`/mys/${museum.id}/about`} shallow>
      <a>About</a>
    </Link>
  </div>
);

const Index = ({ museum }: { museum: FullMuseum }) => (
  <div>
    <h1>{museum.name}</h1>
    <p>Map</p>
    <hr />
    <Link href={`/mys/${museum.id}/collection`} shallow>
      <a>Collection</a>
    </Link>
    <Link href={`/mys/${museum.id}/about`} shallow>
      <a>About</a>
    </Link>
    <hr />
    <ul>
      {museum.galleries.map(gallery => (
        <li key={gallery.id}>
          <Link href={`/mys/${museum.id}/gallery/${gallery.id}`} shallow>
            {gallery.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

type MyseumRootProps =
  | {
      routeName: 'index' | 'collection' | 'about';
      museum: FullMuseum;
      gallery?: undefined;
    }
  | {
      routeName: 'gallery';
      museum: FullMuseum;
      gallery: Gallery;
    };

const MyseumRoot = ({ museum, ...props }: MyseumRootProps) => {
  const router = useRouter();

  const routes =
    typeof router.query.routes === 'string' ? [router.query.routes] : router.query.routes ?? [];

  const route = getRoute(routes);

  switch (route?.name) {
    case 'index': {
      return <Index museum={museum} />;
    }
    case 'collection': {
      return <Collection museum={museum} />;
    }
    case 'about': {
      return <About museum={museum} />;
    }
    case 'gallery': {
      if (props.routeName === 'gallery') {
        return <GalleryPage museum={museum} gallery={props.gallery} galleryId={props.gallery.id} />;
      }

      return <GalleryPage museum={museum} galleryId={route.galleryId} />;
    }
    default: {
      return <NotFound />;
    }
  }
};

export default MyseumRoot;

export const getServerSideProps: GetServerSideProps<
  MyseumRootProps,
  { routes: string[] }
> = async ctx => {
  console.log('SEVERSIDE HIT');
  const routes = ctx.params?.routes;
  const route = getRoute(routes ?? []);

  if (!route) {
    return {
      notFound: true,
    };
  }

  const museum = await MuseumRepository.findOne(route.museumId);
  if (!museum) {
    return {
      notFound: true,
    };
  }

  if (route.name === 'gallery') {
    const gallery = await GalleryRepository.findOneByMuseum(museum.id, route.galleryId);
    if (!gallery) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        routeName: route.name,
        museum,
        gallery,
      },
    };
  }

  return {
    props: {
      routeName: route.name,
      museum,
    },
  };
};
