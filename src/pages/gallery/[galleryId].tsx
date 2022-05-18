import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import * as z from 'zod';
import api from '@src/api/server';
import { GalleryView, GalleryViewProps } from '@src/features/gallery/GalleryView';

export default GalleryView;

interface GalleryPageParams extends ParsedUrlQuery {
  galleryId: string;
}

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  GalleryPageParams
> = async ctx => {
  const user = await api.auth.findUserByCookie(ctx);
  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const galleryId = z.string().uuid().safeParse(ctx.params?.galleryId);
  if (!galleryId.success) {
    return {
      notFound: true,
    };
  }

  const gallery = await api.gallery.findOneByMuseum(user.museumId, galleryId.data);
  if (!gallery) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      // __supabaseUser: supabaseUser.user,
      __userData: user,
      gallery,
    },
  };
};
