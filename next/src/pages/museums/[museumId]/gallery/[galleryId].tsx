import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getMuseumGalleryLayout } from '@src/layouts/MuseumLayout';
import { getGallery, getMuseum } from '@src/data';
import { Gallery, Museum } from '@src/types';

export interface GalleryViewProps {
  gallery: Gallery;
  museum: Museum;
}

const GalleryView = ({ gallery, museum }: GalleryViewProps) => (
  <div>
    <Head>
      <title>
        {gallery.name} | {museum.name}
      </title>
    </Head>

    <h1>This is {gallery.name}</h1>
  </div>
);

GalleryView.getLayout = getMuseumGalleryLayout;

export default GalleryView;

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  { museumId: string; galleryId: string }
> = async ctx => {
  const museumIdStr = ctx.params?.museumId;
  const galleryIdStr = ctx.params?.galleryId;
  if (!museumIdStr || !galleryIdStr) {
    return {
      notFound: true,
    };
  }

  const museumId = Number.parseInt(museumIdStr);
  const galleryId = Number.parseInt(galleryIdStr);
  if (!Number.isFinite(museumId) || !Number.isFinite(galleryId)) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = getMuseum(museumId);
    if (!museum.galleries.find(gallery => gallery.item.id === galleryId)) {
      throw new Error('Gallery not found');
    }
    const gallery = getGallery(galleryId);
    return {
      props: {
        gallery: JSON.parse(JSON.stringify(gallery)),
        museum: JSON.parse(JSON.stringify(museum)),
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
