import { GalleryColor } from '@prisma/client';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';
import { MyseumAPI } from './type';

export const MockAPI: MyseumAPI = {
  auth: {
    async getUserByCookie() {
      return {
        id: 'abc-123',
        name: 'Mock User',
        bio: '',
        headshot: null,
        museumId: 'abc-123',
        addedAt: new Date(),
        modifiedAt: new Date(),
      };
    },
  },

  gallery: {
    async findAllByMuseum(museum: MuseumDto) {
      const galleries: GalleryDto[] = [
        {
          id: 'abc-123',
          name: 'Mock Gallery A',
          description: '',
          artworks: [],
          height: 40,
          color: GalleryColor.mint,
          addedAt: new Date(),
          modifiedAt: new Date(),
          museum,
          museumId: museum.id,
        },
      ];
      return galleries;
    },
  },

  museum: {
    async findOneByCurator(curator: UserDto) {
      const museum: MuseumDto = {
        id: 'abc-123',
        name: 'Mock Museum',
        description: '',
        addedAt: new Date(),
        modifiedAt: new Date(),
        curator,
      };
      return museum;
    },
  },
};
