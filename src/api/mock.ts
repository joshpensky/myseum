import { GalleryColor } from '@prisma/client';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';
import { MyseumAPI } from './type';

export const MockAPI: MyseumAPI = {
  auth: {
    async findUserByCookie() {
      return {
        id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        name: 'Mock User',
        bio: '',
        headshot: null,
        museumId: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        addedAt: new Date(),
        modifiedAt: new Date(),
      };
    },
  },

  gallery: {
    async findAllByMuseum(museum: MuseumDto) {
      const galleries: GalleryDto[] = [
        {
          id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
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

    async findOneByMuseum(museumId: string, galleryId: string) {
      return {
        id: galleryId,
        name: 'Mock Gallery A',
        description: '',
        artworks: [],
        height: 40,
        color: GalleryColor.mint,
        addedAt: new Date(),
        modifiedAt: new Date(),
        museum: {
          id: museumId,
          name: 'Mock Museum',
          description: '',
          addedAt: new Date(),
          modifiedAt: new Date(),
          curator: {
            id: museumId,
            name: 'Mock User',
            bio: '',
            headshot: null,
            museumId,
            addedAt: new Date(),
            modifiedAt: new Date(),
          },
        },
        museumId,
      };
    },
  },

  museum: {
    async findOneByCurator(curator: UserDto) {
      const museum: MuseumDto = {
        id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        name: 'Mock Museum',
        description: '',
        addedAt: new Date(),
        modifiedAt: new Date(),
        curator,
      };
      return museum;
    },

    async findOneById(id: string) {
      const museum: MuseumDto = {
        id,
        name: 'Mock Museum',
        description: '',
        addedAt: new Date(),
        modifiedAt: new Date(),
        curator: {
          id,
          name: 'Mock User',
          bio: '',
          headshot: null,
          museumId: id,
          addedAt: new Date(),
          modifiedAt: new Date(),
        },
      };
      return museum;
    },
  },

  user: {
    async findOneById(id: string) {
      return {
        id,
        name: 'Mock User',
        bio: '',
        headshot: null,
        museumId: id,
        addedAt: new Date(),
        modifiedAt: new Date(),
      };
    },
  },
};
