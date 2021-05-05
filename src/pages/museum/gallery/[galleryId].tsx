import { GetServerSideProps } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/GalleryRepository';
import { supabase } from '@src/data/supabase';
import { GalleryViewProps } from '@src/pages/museum/[museumId]/gallery/[galleryId]';

export { default } from '@src/pages/museum/[museumId]/gallery/[galleryId]';

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  { galleryId: string }
> = async ctx => {
  const galleryId = z.number().int().safeParse(Number(ctx.params?.galleryId));
  if (!galleryId.success) {
    return {
      notFound: true,
    };
  }

  const auth = await supabase.auth.api.getUserByCookie(ctx.req);
  if (!auth.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    const gallery = await GalleryRepository.findOneByUser(auth.user.id, galleryId.data);
    if (!gallery) {
      throw new Error('Museum not found.');
    }

    return {
      props: {
        basePath: `/museum`,
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
