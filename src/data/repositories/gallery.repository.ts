import {
  Artwork,
  Frame,
  Gallery,
  GalleryColor,
  Matting,
  PlacedArtwork,
  Prisma,
} from '@prisma/client';
import { prisma } from '@src/data/prisma';
import { Position } from '@src/types';

export interface AddPlacedArtworkDto {
  artworkId: string;
  frameId?: string;
  position?: Position;
  framingOptions: {
    isScaled: boolean;
    scaling: number;
    matting: Matting;
  };
}

export interface UpdatePlacedArtworkDto {
  id: string;
  position: Position;
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
  museumId: string;
}

export class GalleryRepository {
  static async findAllByMuseum(museumId: string) {
    const galleries = await prisma.gallery.findMany({
      where: {
        museumId,
      },
      orderBy: {
        addedAt: 'desc',
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

  static async findOneByMuseum(museumId: string, galleryId: string) {
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

  static async deleteArtwork(gallery: Gallery, id: string) {
    const deletedPlacedArtwork = await prisma.placedArtwork.delete({
      where: {
        id: id,
      },
    });
    return deletedPlacedArtwork;
  }

  static async addArtwork(
    gallery: Gallery & { artworks: (PlacedArtwork & { artwork: Artwork; frame: Frame | null })[] },
    data: AddPlacedArtworkDto,
  ) {
    const projectedPosition: Position = {
      x: Math.ceil(
        Math.max(0, ...gallery.artworks.map(a => a.posX + (a.frame?.width ?? a.artwork.width))),
      ),
      y: 0,
    };

    let frame: { connect: { id: string } } | undefined = undefined;
    if (data.frameId) {
      frame = {
        connect: {
          id: data.frameId,
        },
      };
    }

    const addedPlacedArtwork = await prisma.placedArtwork.create({
      data: {
        gallery: {
          connect: {
            id: gallery.id,
          },
        },
        artwork: {
          connect: {
            id: data.artworkId,
          },
        },
        frame: frame,
        posX: data.position?.x ?? projectedPosition.x,
        posY: data.position?.y ?? projectedPosition.y,
        isScaled: data.framingOptions.isScaled,
        scaling: data.framingOptions.scaling,
        matting: data.framingOptions.matting,
      },
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
    });

    return addedPlacedArtwork;
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
        const updatedArtworkIdSet = new Set(data.artworks.map(artwork => artwork.id));
        artworksToDelete = {
          id: {
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
          update: (data.artworks ?? []).map(item => ({
            data: {
              posX: item.position.x,
              posY: item.position.y,
            },
            where: {
              id: item.id,
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
