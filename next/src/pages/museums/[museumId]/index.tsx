import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { getMuseumHomeLayout } from '@src/layouts/MuseumLayout';

interface GalleryDto {
  id: number;
  name: string;
}
interface MuseumDto {
  id: number;
  name: string;
  galleries: Record<string, GalleryDto>;
}

export interface MuseumProps {
  museum: MuseumDto;
}

const MuseumMapView = ({ museum }: MuseumProps) => (
  <div>
    <Head>
      <title>{museum.name}</title>
    </Head>

    <ul>
      {Object.values(museum.galleries).map(gallery => (
        <li key={gallery.id}>
          <Link
            href={{
              pathname: '/museums/[museumId]/gallery/[galleryId]',
              query: { museumId: museum.id, galleryId: gallery.id },
            }}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>{gallery.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

MuseumMapView.getLayout = getMuseumHomeLayout;

export default MuseumMapView;

export const getServerSideProps: GetServerSideProps<
  MuseumProps,
  { museumId: string }
> = async ctx => {
  const data: Record<string, MuseumDto> = {
    1: {
      id: 1,
      name: 'Good Museum',
      galleries: {
        1: {
          id: 1,
          name: 'Good Gallery',
        },
      },
    },
  };

  const museumId = ctx.params?.museumId;
  if (!museumId || !(museumId in data)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      museum: data[museumId],
    },
  };
};
