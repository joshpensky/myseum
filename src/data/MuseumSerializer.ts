import { Gallery, Museum, PlacedArtwork, User } from '@prisma/client';
import { ArtworkDto, ArtworkSerializer, PrismaArtwork } from './ArtworkSerializer';
import { GalleryDto, GallerySerializer } from './GallerySerializer';

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
  curator: User;
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
      curator: museum.curator,
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
