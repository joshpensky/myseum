import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { UserRepository } from '@src/data/repositories/user.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';
import { supabase } from '@src/data/supabase';
import { GalleryView, GalleryViewProps } from '@src/features/gallery/GalleryView';

export default GalleryView;

interface GalleryPageParams extends ParsedUrlQuery {
  galleryId: string;
}

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  GalleryPageParams
> = async ctx => {
  const supabaseUser = await supabase.auth.api.getUserByCookie(ctx.req);
  if (!supabaseUser.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const userData = await UserRepository.findOne(supabaseUser.user);
  if (!userData.museum?.id) {
    throw new Error('User must have museum.');
  }

  const galleryId = z.number().int().safeParse(Number(ctx.params?.galleryId));
  if (!galleryId.success) {
    return {
      notFound: true,
    };
  }

  const gallery = await GalleryRepository.findOneByMuseum(userData.museum.id, galleryId.data);
  if (!gallery) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      __supabaseUser: supabaseUser.user,
      __userData: userData,
      gallery: GallerySerializer.serialize(gallery),
    },
  };
};
