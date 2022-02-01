import { Gallery, Museum, Prisma } from '@prisma/client';
import { prisma } from '@src/data/prisma';
import { PrismaMuseum, PrismaMuseumCollectionItem } from '@src/data/serializers/museum.serializer';
import { Position } from '@src/types';

interface GalleryDto {
  name: string;
  color?: Gallery['color'];
  height?: number;
}
interface CreateGalleryDto extends GalleryDto {
  id?: never;
  position: Position;
}
interface UpdateGalleryDto extends GalleryDto {
  id: number;
  position?: Position;
}

export interface UpdateMuseumDto {
  name?: string;
  galleries?: (CreateGalleryDto | UpdateGalleryDto)[];
}

export class MuseumRepository {
  static async findOne(id: number): Promise<PrismaMuseum | null> {
    const museum = await prisma.museum.findUnique({
      where: { id },
      include: {
        curator: true,
      },
    });
    return museum;
  }

  static async findOneByCurator(curatorId: string): Promise<PrismaMuseum | null> {
    const museum = await prisma.museum.findUnique({
      where: { curatorId },
      include: {
        curator: true,
      },
    });
    return museum;
  }

  static async getCollection(museum: Museum): Promise<PrismaMuseumCollectionItem[]> {
    const artworks = await prisma.artwork.findMany({
      distinct: 'id',
      where: {
        owner: {
          museum: {
            id: museum.id,
          },
        },
      },
      include: {
        artist: true,
        placements: {
          include: {
            gallery: true,
          },
        },
      },
    });

    return artworks;
  }

  static async update(museum: Museum, updateMuseumDto: UpdateMuseumDto) {
    let galleriesToDelete:
      | Prisma.Enumerable<Prisma.GalleryScalarWhereInput>
      | undefined = undefined;

    if (updateMuseumDto.galleries) {
      if (updateMuseumDto.galleries.length === 0) {
        // Delete all galleries if empty array passed
        galleriesToDelete = {};
      } else {
        // Otherwise, delete any galleries not included in update
        const updatedGalleryIdSet = new Set(
          updateMuseumDto.galleries
            .filter(gallery => gallery.id !== undefined)
            .map(gallery => (gallery as UpdateGalleryDto).id),
        );
        galleriesToDelete = {
          id: {
            notIn: Array.from(updatedGalleryIdSet),
          },
        };
      }
    }

    const updatedMuseum = await prisma.museum.update({
      data: {
        name: updateMuseumDto.name,
        galleries: {
          deleteMany: galleriesToDelete,
          createMany: {
            data: ((updateMuseumDto.galleries ?? []).filter(
              gallery => gallery.id === undefined,
            ) as CreateGalleryDto[]).map(gallery => ({
              name: gallery.name,
              color: gallery.color,
              height: gallery.height,
              posX: gallery.position.x,
              posY: gallery.position.y,
            })),
          },
          update: ((updateMuseumDto.galleries ?? []).filter(
            gallery => gallery.id !== undefined,
          ) as UpdateGalleryDto[]).map(gallery => ({
            data: {
              name: gallery.name,
              color: gallery.color,
              height: gallery.height,
              posX: gallery.position?.x,
              posY: gallery.position?.y,
            },
            where: {
              id: gallery.id,
            },
          })),
        },
      },
      where: {
        id: museum.id,
      },
      include: {
        curator: true,
      },
    });

    return updatedMuseum;
  }
}
