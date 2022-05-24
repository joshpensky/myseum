import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import { withPageAuth } from '@supabase/supabase-auth-helpers/nextjs';
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
> = withPageAuth({
  redirectTo: '/',
  async getServerSideProps(ctx) {
    {
      const galleryId = z.string().uuid().safeParse(ctx.params?.galleryId);
      if (!galleryId.success) {
        return {
          notFound: true,
        };
      }

      const user = await api.auth.findUserByCookie(ctx);
      if (!user) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
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
          __authUser: user,
          gallery,
        },
      };
    }
  },
});
