import axios from 'axios';
import type { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { MuseumWithGalleriesDto } from '@src/data/serializers/museum.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';
import { supabase } from '@src/data/supabase';
import type { MyseumAPI } from './type';

export const ClientAPI: MyseumAPI = {
  artwork: {
    async create(data) {
      const res = await axios.post<ArtworkDto>('/api/artworks', data);
      return res.data;
    },

    async delete(id) {
      await axios.delete(`/api/artworks/${id}`);
    },

    async findAllByUser(user) {
      const res = await axios.get<ArtworkDto[]>(`/api/user/${user.id}/artworks`);
      return res.data;
    },

    async update(id, data) {
      const res = await axios.put<ArtworkDto>(`/api/artworks/${id}`, data);
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
        axios.post('/api/auth', { event, session }, { withCredentials: true });
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
    async create(data) {
      const res = await axios.post<FrameDto>('/api/frames', data);
      return res.data;
    },

    async findAllByUser(user) {
      const res = await axios.get<FrameDto[]>(`/api/user/${user.id}/frames`);
      return res.data;
    },
  },

  gallery: {
    async addPlacedArtwork(gallery, data) {
      const res = await axios.post<PlacedArtworkDto>(
        `/api/museum/${gallery.museum.id}/gallery/${gallery.id}/artworks`,
        data,
      );
      return res.data;
    },

    async create(data) {
      const res = await axios.post<GalleryDto>(`/api/museum/${data.museumId}/gallery`, data);
      return res.data;
    },

    async delete(museumId, galleryId) {
      await axios.delete(`/api/museum/${museumId}/gallery/${galleryId}`);
    },

    async findAllByMuseum() {
      throw new Error('Implementation only available on server.');
    },

    async findOneByMuseum() {
      throw new Error('Implementation only available on server.');
    },

    async update(museumId, galleryId, data) {
      const res = await axios.put<GalleryDto>(`/api/museum/${museumId}/gallery/${galleryId}`, data);
      return res.data;
    },
  },

  museum: {
    async findOneByCurator() {
      throw new Error('Implementation only available on server.');
    },

    async findOneById() {
      throw new Error('Implementation only available on server.');
    },

    async update(id, data) {
      const res = await axios.put<MuseumWithGalleriesDto>(`/api/museum/${id}`, data);
      return res.data;
    },
  },

  user: {
    async delete(id) {
      await axios.delete(`/api/user/${id}`);
    },

    async findOneById(id, config) {
      const res = await axios.get<UserDto>(`/api/user/${id}`, config);
      return res.data;
    },

    async update(id, data) {
      const res = await axios.put<UserDto>(`/api/user/${id}`, data);
      return res.data;
    },
  },
};
