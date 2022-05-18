import { GalleryColor } from '@prisma/client';
import type { CreateArtworkDto } from '@src/data/repositories/artwork.repository';
import type { GalleryDto } from '@src/data/serializers/gallery.serializer';
import type { MuseumDto } from '@src/data/serializers/museum.serializer';
import type { UserDto } from '@src/data/serializers/user.serializer';
import type { MyseumAPI } from './type';

export const MockAPI: MyseumAPI = {
  artwork: {
    async create(data: CreateArtworkDto) {
      return {
        id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        title: data.title,
        description: data.description,
        artist: null,
        src: data.src,
        alt: data.alt,
        size: data.size,
        unit: data.unit,
        createdAt: data.createdAt ?? null,
        acquiredAt: data.acquiredAt,
        addedAt: new Date(),
        modifiedAt: new Date(),
        owner: {
          id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
          name: 'Mock User',
          bio: '',
          headshot: null,
          museumId: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
          addedAt: new Date(),
          modifiedAt: new Date(),
        },
      };
    },

    async findAllByUser(user: UserDto) {
      return [
        {
          id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
          title: 'Mock Artwork',
          description: '',
          artist: null,
          src:
            'https://images.unsplash.com/photo-1652796402043-094ea9c540aa?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987',
          alt: '',
          size: {
            width: 2,
            height: 3,
            depth: 1,
          },
          unit: 'in',
          createdAt: null,
          acquiredAt: new Date(),
          addedAt: new Date(),
          modifiedAt: new Date(),
          owner: user,
        },
      ];
    },
  },

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

  frame: {
    async findAllByUser(user: UserDto) {
      return [
        {
          id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
          name: 'Mock Frame',
          src:
            'https://images.unsplash.com/photo-1652796402043-094ea9c540aa?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987',
          alt: '',
          size: {
            width: 2,
            height: 3,
            depth: 1,
          },
          window: [
            { x: 0.2, y: 0.2 },
            { x: 0.8, y: 0.2 },
            { x: 0.8, y: 0.8 },
            { x: 0.2, y: 0.8 },
          ],
          // unit: 'in',
          addedAt: new Date(),
          modifiedAt: new Date(),
          owner: user,
        },
      ];
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
