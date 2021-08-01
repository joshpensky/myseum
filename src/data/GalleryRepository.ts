import { Gallery, Prisma } from '@prisma/client';
import { prisma } from '@src/data/prisma';
import { Position } from '@src/types';

interface UpdateGalleryArtworkDto {
  artworkId: number;
  position: Position;
}

export interface UpdateGalleryDto {
  name?: string;
  color?: Gallery['color'];
  height?: number;
  artworks?: UpdateGalleryArtworkDto[];
}

export class GalleryRepository {
  static async findAllByMuseum(museumId: number) {
    const galleries = await prisma.gallery.findMany({
      where: {
        museumId,
      },
      include: {
        artworks: {
          include: {
            artwork: {
              include: {
                frame: true,
                artist: true,
              },
            },
          },
        },
      },
    });
    return galleries;
  }

  static async findOneByMuseum(museumId: number, galleryId: number) {
    const gallery = await prisma.gallery.findFirst({
      where: {
        id: galleryId,
        museumId,
      },
      include: {
        artworks: {
          include: {
            artwork: {
              include: {
                frame: true,
                artist: true,
              },
            },
          },
        },
      },
    });

    return gallery;
  }
  static async update(gallery: Gallery, data: UpdateGalleryDto) {
    let artworksToDelete:
      | Prisma.Enumerable<Prisma.GalleryArtworkScalarWhereInput>
      | undefined = undefined;

    if (data.artworks) {
      if (data.artworks.length === 0) {
        // Delete all artworks if empty array passed
        artworksToDelete = {};
      } else {
        // Otherwise, delete any artworks not included in update
        const updatedArtworkIdSet = new Set(data.artworks.map(artwork => artwork.artworkId));
        artworksToDelete = {
          artworkId: {
            notIn: Array.from(updatedArtworkIdSet),
          },
        };
      }
    }

    const updatedGallery = await prisma.gallery.update({
      data: {
        name: data.name,
        color: data.color,
        height: data.height,
        artworks: {
          deleteMany: artworksToDelete,
          upsert: (data.artworks ?? []).map(item => ({
            create: {
              artworkId: item.artworkId,
              xPosition: item.position.x,
              yPosition: item.position.y,
            },
            update: {
              xPosition: item.position.x,
              yPosition: item.position.y,
            },
            where: {
              artworkId_galleryId: {
                artworkId: item.artworkId,
                galleryId: gallery.id,
              },
            },
          })),
        },
      },
      where: {
        id: gallery.id,
      },
      include: {
        artworks: {
          include: {
            artwork: {
              include: {
                frame: true,
                artist: true,
              },
            },
          },
        },
      },
    });
    return updatedGallery;
  }
}
