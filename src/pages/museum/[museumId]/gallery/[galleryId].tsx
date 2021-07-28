import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/GalleryRepository';
import { GalleryView, GalleryViewProps } from '@src/features/gallery';
import { MuseumGalleryLayout } from '@src/layouts/museum';

(GalleryView as any).Layout = MuseumGalleryLayout;

export default GalleryView;

interface GalleryViewParams extends ParsedUrlQuery {
  museumId: string;
  galleryId: string;
}

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  GalleryViewParams
> = async ctx => {
  const museumId = z.number().int().safeParse(Number(ctx.params?.museumId));
  const galleryId = z.number().int().safeParse(Number(ctx.params?.galleryId));
  if (!museumId.success || !galleryId.success) {
    return {
      notFound: true,
    };
  }

  try {
    const gallery = await GalleryRepository.findOneByMuseum(museumId.data, galleryId.data);
    if (!gallery) {
      throw new Error('Gallery not found.');
    }

    return {
      props: {
        basePath: `/museum/${gallery.museum.id}`,
        museum: gallery.museum,
        gallery,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
