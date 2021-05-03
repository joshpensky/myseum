import { Gallery, Museum, Prisma, User } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { prisma } from '@src/data/prisma';

interface GalleryDto {
  name: string;
  color?: Gallery['color'];
  height?: number;
}
interface CreateGalleryDto extends GalleryDto {
  id?: never;
  xPosition: number;
  yPosition: number;
}
interface UpdateGalleryDto extends GalleryDto {
  id: number;
  xPosition?: number;
  yPosition?: number;
}

export interface UpdateMuseumDto {
  name?: string;
  galleries?: (CreateGalleryDto | UpdateGalleryDto)[];
}

export class MuseumRepository {
  static async findById(id: number) {
    const museum = await prisma.museum.findUnique({
      where: { id },
      include: {
        curator: true,
        galleries: true,
      },
    });
    return museum;
  }

  static async findByUser(user: User | SupabaseUser) {
    const museum = await prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .museum({
        include: {
          curator: true,
          galleries: true,
        },
      });
    return museum;
  }

  static async update(museum: Museum & { galleries: Gallery[] }, updateMuseumDto: UpdateMuseumDto) {
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

    console.log(updateMuseumDto);

    const updatedMuseum = await prisma.museum.update({
      data: {
        name: updateMuseumDto.name,
        galleries: {
          deleteMany: galleriesToDelete,
          createMany: {
            data: (updateMuseumDto.galleries ?? []).filter(
              gallery => gallery.id === undefined,
            ) as CreateGalleryDto[],
          },
          update: (updateMuseumDto.galleries ?? [])
            .filter(gallery => gallery.id !== undefined)
            .map(gallery => ({
              data: gallery as UpdateGalleryDto,
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
        galleries: true,
      },
    });

    return updatedMuseum;
  }
}
