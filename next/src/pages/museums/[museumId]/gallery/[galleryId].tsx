import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getMuseumGalleryLayout } from '@src/layouts/MuseumLayout';

interface GalleryDto {
  id: number;
  name: string;
}
interface MuseumDto {
  id: number;
  name: string;
  galleries: Record<string, GalleryDto>;
}

export interface GalleryProps {
  gallery: GalleryDto;
  museum: MuseumDto;
}

const Gallery = ({ gallery, museum }: GalleryProps) => (
  <div>
    <Head>
      <title>
        {gallery.name} | {museum.name}
      </title>
    </Head>

    <h1>This is {gallery.name}</h1>
  </div>
);

Gallery.getLayout = getMuseumGalleryLayout;

export default Gallery;

export const getServerSideProps: GetServerSideProps<
  GalleryProps,
  { museumId: string; galleryId: string }
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

  const museum = data[museumId];

  const galleryId = ctx.params?.galleryId;
  if (!galleryId || !(galleryId in museum.galleries)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      museum,
      gallery: museum.galleries[galleryId],
    },
  };
};
