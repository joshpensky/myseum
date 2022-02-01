import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { UserRepository } from '@src/data/repositories/user.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';
import { MuseumSerializer } from '@src/data/serializers/museum.serializer';
import { supabase } from '@src/data/supabase';
import { GalleryView, GalleryViewProps } from '@src/features/gallery';

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

  const museum = await MuseumRepository.findOneByCurator(supabaseUser.user.id);
  if (!museum) {
    throw new Error('User must have museum.');
  }

  const galleryId = z.number().int().safeParse(Number(ctx.params?.galleryId));
  if (!galleryId.success) {
    return {
      notFound: true,
    };
  }

  const gallery = await GalleryRepository.findOneByMuseum(museum.id, galleryId.data);
  if (!gallery) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      __supabaseUser: supabaseUser.user,
      __userData: userData,
      museum: MuseumSerializer.serialize(museum),
      gallery: GallerySerializer.serialize(gallery),
    },
  };
};
