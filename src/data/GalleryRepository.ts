import { Gallery, Prisma } from '@prisma/client';
import * as z from 'zod';
import { prisma } from '@src/data/prisma';

interface UpdateGalleryArtworkDto {
  artworkId: number;
  xPosition: number;
  yPosition: number;
}

interface UpdateGalleryDto {
  name?: string;
  color?: Gallery['color'];
  height?: number;
  artworks?: UpdateGalleryArtworkDto[];
}

export class GalleryRepository {
  static async findOneByMuseum(museumId: number, galleryId: number) {
    const gallery = await prisma.gallery.findFirst({
      where: {
        id: galleryId,
        museumId,
      },
      include: {
        museum: {
          include: {
            galleries: {
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
            },
            curator: true,
          },
        },
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

  static async findOneByUser(userId: string, galleryId: number) {
    if (!z.string().uuid().check(userId)) {
      throw new Error('User ID must be a valid UUID.');
    }

    const gallery = await prisma.gallery.findFirst({
      where: {
        id: galleryId,
        museum: {
          curatorId: userId,
        },
      },
      include: {
        museum: {
          include: {
            galleries: {
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
            },
            curator: true,
          },
        },
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
              xPosition: item.xPosition,
              yPosition: item.yPosition,
            },
            update: {
              xPosition: item.xPosition,
              yPosition: item.yPosition,
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
