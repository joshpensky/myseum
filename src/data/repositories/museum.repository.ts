import { Museum } from '@prisma/client';
import { prisma } from '@src/data/prisma';
import { PrismaMuseum } from '@src/data/serializers/museum.serializer';

export interface UpdateMuseumDto {
  name: string;
  description: string;
}

export class MuseumRepository {
  static async findOne(id: string): Promise<PrismaMuseum | null> {
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

  static async update(museum: Museum, updateMuseumDto: UpdateMuseumDto) {
    // const galleriesToDelete:
    //   | Prisma.Enumerable<Prisma.GalleryScalarWhereInput>
    //   | undefined = undefined;

    // if (updateMuseumDto.galleries) {
    //   if (updateMuseumDto.galleries.length === 0) {
    //     // Delete all galleries if empty array passed
    //     galleriesToDelete = {};
    //   } else {
    //     // Otherwise, delete any galleries not included in update
    //     const updatedGalleryIdSet = new Set(
    //       updateMuseumDto.galleries
    //         .filter(gallery => gallery.id !== undefined)
    //         .map(gallery => (gallery as UpdateGalleryDto).id),
    //     );
    //     galleriesToDelete = {
    //       id: {
    //         notIn: Array.from(updatedGalleryIdSet),
    //       },
    //     };
    //   }
    // }

    const updatedMuseum = await prisma.museum.update({
      data: {
        name: updateMuseumDto.name,
        description: updateMuseumDto.description,
        // galleries: {
        //   deleteMany: galleriesToDelete,
        //   createMany: {
        //     data: ((updateMuseumDto.galleries ?? []).filter(
        //       gallery => gallery.id === undefined,
        //     ) as CreateGalleryDto[]).map(gallery => ({
        //       name: gallery.name,
        //       color: gallery.color,
        //       height: gallery.height,
        //       posX: gallery.position.x,
        //       posY: gallery.position.y,
        //     })),
        //   },
        //   update: ((updateMuseumDto.galleries ?? []).filter(
        //     gallery => gallery.id !== undefined,
        //   ) as UpdateGalleryDto[]).map(gallery => ({
        //     data: {
        //       name: gallery.name,
        //       color: gallery.color,
        //       height: gallery.height,
        //       posX: gallery.position?.x,
        //       posY: gallery.position?.y,
        //     },
        //     where: {
        //       id: gallery.id,
        //     },
        //   })),
        // },
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
