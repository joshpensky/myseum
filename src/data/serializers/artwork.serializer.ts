import { Artist, Artwork, MeasureUnit } from '@prisma/client';
import { Dimensions3D } from '@src/types';
import { PrismaUser, UserDto } from './user.serializer';

export interface PrismaArtwork extends Artwork {
  artist: Artist | null;
  owner: Pick<PrismaUser, 'id' | 'name'>;
}

export interface ArtworkDto {
  id: string;
  title: string;
  description: string;
  src: string;
  alt: string;
  size: Dimensions3D;
  unit: MeasureUnit;
  artist: Artist | null;
  owner: Pick<UserDto, 'id' | 'name'>;
  createdAt: Date | null;
  acquiredAt: Date;
  addedAt: Date;
  modifiedAt: Date;
}

export class ArtworkSerializer {
  static serialize(artwork: PrismaArtwork): ArtworkDto {
    return {
      id: artwork.id,
      title: artwork.title,
      description: artwork.description,
      src: artwork.src,
      alt: artwork.alt,
      size: {
        width: artwork.width,
        height: artwork.height,
        depth: artwork.depth,
      },
      unit: artwork.unit,
      artist: artwork.artist ?? null,
      owner: artwork.owner,
      createdAt: artwork.createdAt ?? null,
      acquiredAt: artwork.acquiredAt,
      addedAt: artwork.addedAt,
      modifiedAt: artwork.modifiedAt,
    };
  }
}
