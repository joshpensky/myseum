import { Artist } from '@prisma/client';

export interface ArtistDto {
  id: number;
  name: string;
}

export class ArtistSerializer {
  static serialize(artist: Artist): ArtistDto {
    return {
      id: artist.id,
      name: artist.name,
    };
  }
}
