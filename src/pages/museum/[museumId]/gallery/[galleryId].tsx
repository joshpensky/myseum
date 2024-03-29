import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import * as z from 'zod';
import api from '@src/api/server';
import { GalleryView, GalleryViewProps } from '@src/features/gallery/GalleryView';

export default GalleryView;

interface GalleryPageParams extends ParsedUrlQuery {
  museumId: string;
  galleryId: string;
}

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  GalleryPageParams
> = async ctx => {
  const museumId = z.string().uuid().safeParse(ctx.params?.museumId);
  const galleryId = z.string().uuid().safeParse(ctx.params?.galleryId);
  if (!museumId.success || !galleryId.success) {
    return {
      notFound: true,
    };
  }

  const gallery = await api.gallery.findOneByMuseum(museumId.data, galleryId.data);
  if (!gallery) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      gallery,
    },
  };
};
