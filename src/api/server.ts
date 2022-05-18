import { GetServerSidePropsContext } from 'next';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { UserRepository } from '@src/data/repositories/user.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumSerializer } from '@src/data/serializers/museum.serializer';
import { UserDto, UserSerializer } from '@src/data/serializers/user.serializer';
import { supabase } from '@src/data/supabase';
import { ClientAPI } from './client';
import { MockAPI } from './mock';
import { MyseumAPI } from './type';

let api: MyseumAPI;
if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
  api = MockAPI;
} else {
  api = {
    ...ClientAPI,

    auth: {
      ...ClientAPI.auth,

      async findUserByCookie(context: GetServerSidePropsContext) {
        const supabaseUser = await supabase.auth.api.getUserByCookie(context.req);
        if (!supabaseUser.user) {
          return null;
        }
        const user = await UserRepository.findOne(supabaseUser.user);
        const serializedUser = UserSerializer.serialize(user);
        return {
          ...supabaseUser.user,
          ...serializedUser,
          email: supabaseUser.user.email as string,
        };
      },
    },

    gallery: {
      ...ClientAPI.gallery,

      async findAllByMuseum(museum: MuseumDto) {
        const galleries = await GalleryRepository.findAllByMuseum(museum.id);
        return galleries.map(gallery => GallerySerializer.serialize(gallery));
      },

      async findOneByMuseum(museumId: string, galleryId: string) {
        const gallery = await GalleryRepository.findOneByMuseum(museumId, galleryId);
        if (!gallery) {
          return null;
        }
        return GallerySerializer.serialize(gallery);
      },
    },

    museum: {
      ...ClientAPI.museum,

      async findOneByCurator(curator: UserDto) {
        const museum = await MuseumRepository.findOneByCurator(curator.id);
        if (!museum) {
          throw new Error('Something went wrong. User should have associated museum.');
        }
        return MuseumSerializer.serialize(museum);
      },

      async findOneById(id: string) {
        const museum = await MuseumRepository.findOne(id);
        if (!museum) {
          return null;
        }
        return MuseumSerializer.serialize(museum);
      },
    },

    user: {
      ...ClientAPI.user,

      async findOneById(id: string) {
        const user = await UserRepository.findOne(id);
        if (!user) {
          return null;
        }
        return UserSerializer.serialize(user);
      },
    },
  };
}

export default api;
