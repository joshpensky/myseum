import { GetServerSidePropsContext } from 'next';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { UserRepository } from '@src/data/repositories/user.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumSerializer } from '@src/data/serializers/museum.serializer';
import { UserDto, UserSerializer } from '@src/data/serializers/user.serializer';
import { supabase } from '@src/data/supabase';
import { MyseumAPI } from './type';

export const ClientAPI: MyseumAPI = {
  auth: {
    async getUserByCookie(context: GetServerSidePropsContext) {
      const supabaseUser = await supabase.auth.api.getUserByCookie(context.req);
      if (!supabaseUser.user) {
        return null;
      }
      const user = await UserRepository.findOne(supabaseUser.user);
      return UserSerializer.serialize(user);
    },
  },

  gallery: {
    async findAllByMuseum(museum: MuseumDto) {
      const galleries = await GalleryRepository.findAllByMuseum(museum.id);
      return galleries.map(gallery => GallerySerializer.serialize(gallery));
    },
  },

  museum: {
    async findOneByCurator(curator: UserDto) {
      const museum = await MuseumRepository.findOneByCurator(curator.id);
      if (!museum) {
        throw new Error('Something went wrong. User should have associated museum.');
      }
      return MuseumSerializer.serialize(museum);
    },
  },
};
