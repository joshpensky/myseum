import { Gallery } from '@prisma/client';
import * as z from 'zod';
import { prisma } from '@src/data/prisma';

interface UpdateGalleryDto {
  name?: string;
  color?: Gallery['color'];
  height?: number;
  artworks?: {
    artworkId: number;
    xPosition: number;
    yPosition: number;
  }[];
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
    const updatedGallery = await prisma.gallery.update({
      data: {
        name: data.name,
        color: data.color,
        height: data.height,
        artworks: {
          update: (data.artworks ?? []).map(artwork => ({
            data: {
              xPosition: artwork.xPosition,
              yPosition: artwork.yPosition,
            },
            where: {
              artworkId_galleryId: {
                artworkId: artwork.artworkId,
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
