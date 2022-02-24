import { Artist } from '@prisma/client';

export interface ArtistDto {
  id: string;
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
