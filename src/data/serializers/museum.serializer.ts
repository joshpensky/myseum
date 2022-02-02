import { Gallery, Museum, PlacedArtwork, User } from '@prisma/client';
import { ArtworkDto, ArtworkSerializer, PrismaArtwork } from './artwork.serializer';
import { GalleryDto, GallerySerializer } from './gallery.serializer';
import { UserDto, UserSerializer } from './user.serializer';

export interface PrismaMuseum extends Museum {
  curator: User;
}

export interface PrismaMuseumCollectionItem extends PrismaArtwork {
  placements: (PlacedArtwork & {
    gallery: Gallery;
  })[];
}

export interface MuseumDto {
  id: number;
  name: string;
  description: string;
  curator: UserDto;
  addedAt: Date;
  modifiedAt: Date;
}

export interface MuseumCollectionItemDto {
  artwork: ArtworkDto;
  galleries: Omit<GalleryDto, 'artworks'>[];
}

export class MuseumSerializer {
  static serialize(museum: PrismaMuseum): MuseumDto {
    return {
      id: museum.id,
      name: museum.name,
      description: museum.description,
      curator: UserSerializer.serialize({ ...museum.curator, museum }),
      addedAt: museum.addedAt,
      modifiedAt: museum.modifiedAt,
    };
  }

  static serializeCollection(collection: PrismaMuseumCollectionItem[]): MuseumCollectionItemDto[] {
    return collection.map(item => {
      const { placements, ...artwork } = item;
      return {
        artwork: ArtworkSerializer.serialize(artwork),
        galleries: placements.map(item => {
          // Need to construct type with optional artworks in order to remove it from object
          type GalleryDtoWithOptionalArtworks = Omit<GalleryDto, 'artworks'> &
            Partial<Pick<GalleryDto, 'artworks'>>;
          const gallery: GalleryDtoWithOptionalArtworks = GallerySerializer.serialize({
            ...item.gallery,
            artworks: [],
          });
          delete gallery.artworks;
          return gallery;
        }),
      };
    });
  }
}
