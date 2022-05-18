import { GalleryColor } from '@prisma/client';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';
import { MyseumAPI } from './type';

export const MockAPI: MyseumAPI = {
  artwork: {
    async create(data) {
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

    async findAllByUser(user) {
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

    async delete() {},
  },

  auth: {
    async findUserByCookie() {
      return {
        // Prisma fields
        id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        name: 'Mock User',
        bio: '',
        headshot: null,
        museumId: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        addedAt: new Date(),
        modifiedAt: new Date(),
        // Supabase fields
        aud: 'authenticated',
        confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        email: 'user@mock.com',
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
        app_metadata: {
          provider: 'google',
        },
        user_metadata: {},
      };
    },

    getCurrentUser() {
      return {
        id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        aud: 'authenticated',
        confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        email: 'user@mock.com',
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
        app_metadata: {
          provider: 'google',
        },
        user_metadata: {},
      };
    },

    onStateChange(callback) {
      const currentUser = this.getCurrentUser();
      function handleSignIn() {
        callback('SIGNED_IN', currentUser);
      }
      window.addEventListener('__mock_sign_in', handleSignIn);

      function handleSignOut() {
        callback('SIGNED_OUT', null);
      }
      window.addEventListener('__mock_sign_out', handleSignOut);

      return {
        unsubscribe() {
          window.removeEventListener('__mock_sign_in', handleSignIn);
          window.removeEventListener('__mock_sign_out', handleSignOut);
        },
      };
    },

    async signIn() {
      const signInEvent = new Event('__mock_sign_in');
      window.dispatchEvent(signInEvent);
    },

    async signOut() {
      const signOutEvent = new Event('__mock_sign_out');
      window.dispatchEvent(signOutEvent);
    },
  },

  frame: {
    async findAllByUser(user) {
      return [
        {
          id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
          name: 'Mock Frame',
          src:
            'https://images.unsplash.com/photo-1652796402043-094ea9c540aa?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987',
          alt: '',
          size: {
            width: 4,
            height: 6,
            depth: 2,
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
    async addPlacedArtwork(gallery, data) {
      const user: UserDto = {
        id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        name: 'Mock User',
        bio: '',
        headshot: null,
        museumId: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        addedAt: new Date(),
        modifiedAt: new Date(),
      };

      const artwork: ArtworkDto = {
        id: data.artworkId,
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
      };

      let frame: FrameDto | null = null;
      if (data.frameId) {
        frame = {
          id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
          name: 'Mock Frame',
          src:
            'https://images.unsplash.com/photo-1652796402043-094ea9c540aa?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987',
          alt: '',
          size: {
            width: 4,
            height: 6,
            depth: 2,
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
        };
      }

      return {
        artwork,
        frame,
        framingOptions: data.framingOptions,
        position: { x: 0, y: 0 },
        size: frame?.size ?? artwork.size,
        addedAt: new Date(),
        modifiedAt: new Date(),
      };
    },

    async create(data) {
      return {
        id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        name: data.name,
        description: data.description,
        artworks: [],
        height: data.height,
        color: data.color,
        addedAt: new Date(),
        modifiedAt: new Date(),
        museum: {
          id: data.museumId,
          name: 'Mock Museum',
          description: '',
          addedAt: new Date(),
          modifiedAt: new Date(),
          curator: {
            id: data.museumId,
            name: 'Mock User',
            bio: '',
            headshot: null,
            museumId: data.museumId,
            addedAt: new Date(),
            modifiedAt: new Date(),
          },
        },
        museumId: data.museumId,
      };
    },

    async findAllByMuseum(museum) {
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

    async findOneByMuseum(museumId, galleryId) {
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

    async update(museumId, galleryId, data) {
      return {
        id: galleryId,
        name: data.name,
        description: data.description,
        artworks: [],
        height: data.height ?? 40,
        color: data.color ?? GalleryColor.mint,
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

    async delete() {},
  },

  museum: {
    async findOneByCurator(curator) {
      return {
        id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
        name: 'Mock Museum',
        description: '',
        addedAt: new Date(),
        modifiedAt: new Date(),
        curator,
      };
    },

    async findOneById(id) {
      return {
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
    },

    async update(id, data) {
      const user: UserDto = {
        id,
        name: 'Mock User',
        bio: '',
        headshot: null,
        museumId: id,
        addedAt: new Date(),
        modifiedAt: new Date(),
      };

      return {
        id,
        name: data.name,
        description: data.description,
        addedAt: new Date(),
        modifiedAt: new Date(),
        galleries: [
          {
            id: 'a66435d2-dd82-4207-9f77-b1eef3a16a1e',
            name: 'Mock Gallery A',
            description: '',
            artworks: [],
            height: 40,
            color: GalleryColor.mint,
            addedAt: new Date(),
            modifiedAt: new Date(),
            museum: {
              id,
              name: data.name,
              description: data.description,
              addedAt: new Date(),
              modifiedAt: new Date(),
              curator: user,
            },
            museumId: id,
          },
        ],
        curator: user,
      };
    },
  },

  user: {
    async findOneById(id) {
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

    async update(id, data) {
      return {
        id,
        name: data.name,
        bio: data.bio ?? '',
        headshot: data.headshot ?? null,
        museumId: id,
        addedAt: new Date(),
        modifiedAt: new Date(),
      };
    },

    async delete() {},
  },
};
