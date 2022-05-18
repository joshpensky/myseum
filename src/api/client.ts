import axios from 'axios';
import type { CreateArtworkDto } from '@src/data/repositories/artwork.repository';
import type { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';
import type { MyseumAPI } from './type';

export const ClientAPI: MyseumAPI = {
  artwork: {
    async create(data: CreateArtworkDto) {
      const res = await axios.post<ArtworkDto>('/api/artworks', data);
      return res.data;
    },

    async findAllByUser(user: UserDto) {
      const res = await axios.get<ArtworkDto[]>(`/api/user/${user.id}/artworks`);
      return res.data;
    },
  },

  auth: {
    async findUserByCookie() {
      throw new Error('Implementation only available on server.');
    },

    async findMyArtworks() {
      const res = await axios.get<ArtworkDto[]>('/api/me/artworks');
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
    async findOneById() {
      throw new Error('Implementation only available on server.');
    },
  },
};
