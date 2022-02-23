import { Gallery, GalleryColor, Matting, Prisma } from '@prisma/client';
import { prisma } from '@src/data/prisma';
import { Position } from '@src/types';

interface UpdatePlacedArtworkDto {
  artworkId: number;
  frameId?: number;
  position: Position;
  framingOptions: {
    isScaled: boolean;
    scaling: number;
    matting: Matting;
  };
}

export interface UpdateGalleryDto {
  name: string;
  description: string;
  color?: GalleryColor;
  height?: number;
  artworks?: UpdatePlacedArtworkDto[];
}

export interface CreateGalleryDto {
  name: string;
  description: string;
  color: GalleryColor;
  height: number;
  museumId: number;
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
                artist: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            frame: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        museum: {
          include: {
            curator: true,
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
                artist: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            frame: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        museum: {
          include: {
            curator: true,
          },
        },
      },
    });

    return gallery;
  }

  static async create(data: CreateGalleryDto) {
    const gallery = await prisma.gallery.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        height: data.height,
        museum: {
          connect: {
            id: data.museumId,
          },
        },
      },
      include: {
        artworks: {
          include: {
            artwork: {
              include: {
                artist: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            frame: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        museum: {
          include: {
            curator: true,
          },
        },
      },
    });
    return gallery;
  }

  static async update(gallery: Gallery, data: UpdateGalleryDto) {
    let artworksToDelete:
      | Prisma.Enumerable<Prisma.PlacedArtworkScalarWhereInput>
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
        description: data.description,
        color: data.color,
        height: data.height,
        artworks: {
          deleteMany: artworksToDelete,
          upsert: (data.artworks ?? []).map(item => ({
            create: {
              artworkId: item.artworkId,
              frameId: item.frameId,
              posX: item.position.x,
              posY: item.position.y,
              isScaled: item.framingOptions.isScaled,
              scaling: item.framingOptions.scaling,
              matting: item.framingOptions.matting,
            },
            update: {
              frameId: item.frameId,
              posX: item.position.x,
              posY: item.position.y,
              isScaled: item.framingOptions.isScaled,
              scaling: item.framingOptions.scaling,
              matting: item.framingOptions.matting,
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
                artist: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            frame: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        museum: {
          include: {
            curator: true,
          },
        },
      },
    });
    return updatedGallery;
  }

  static async delete(gallery: Gallery) {
    const deletedGallery = await prisma.gallery.delete({
      where: {
        id: gallery.id,
      },
      include: {
        artworks: {
          include: {
            artwork: {
              include: {
                artist: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            frame: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        museum: {
          include: {
            curator: true,
          },
        },
      },
    });
    return deletedGallery;
  }
}
