import axios from 'axios';
import type { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';
import { supabase } from '@src/data/supabase';
import type { MyseumAPI } from './type';

export const ClientAPI: MyseumAPI = {
  artwork: {
    async create(data) {
      const res = await axios.post<ArtworkDto>('/api/artworks', data);
      return res.data;
    },

    async findAllByUser(user) {
      const res = await axios.get<ArtworkDto[]>(`/api/user/${user.id}/artworks`);
      return res.data;
    },
  },

  auth: {
    async findUserByCookie() {
      throw new Error('Implementation only available on server.');
    },

    onStateChange(callback) {
      const subscription = supabase.auth.onAuthStateChange((event, session) => {
        // Update SSR cookie on auth state change
        fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        });
        // Callback for additional functionality
        callback(event, session?.user ?? null);
      });
      return subscription.data;
    },

    getCurrentUser() {
      return supabase.auth.user();
    },

    async signIn(options) {
      const { error } = await supabase.auth.signIn({ provider: 'google' }, options);
      if (error) {
        throw error;
      }
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    },
  },

  frame: {
    async findAllByUser(user) {
      const res = await axios.get<FrameDto[]>(`/api/user/${user.id}/frames`);
      return res.data;
    },
  },

  gallery: {
    async findAllByMuseum() {
      throw new Error('Implementation only available on server.');
    },

    async findOneByMuseum() {
      throw new Error('Implementation only available on server.');
    },
  },

  museum: {
    async findOneByCurator() {
      throw new Error('Implementation only available on server.');
    },

    async findOneById() {
      throw new Error('Implementation only available on server.');
    },
  },

  user: {
    async findOneById(id, config) {
      const res = await axios.get<UserDto>(`/api/user/${id}`, config);
      return res.data;
    },
  },
};
