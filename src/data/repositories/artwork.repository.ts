import { Artwork, MeasureUnit } from '@prisma/client';
import { prisma } from '@src/data/prisma';
import { Dimensions3D } from '@src/types';
import { uploadSupabaseFile } from '@src/utils/uploadSupabaseFile';

export interface CreateArtworkDto {
  ownerId: string;
  title: string;
  description: string;
  src: string;
  alt: string;
  size: Dimensions3D;
  unit: MeasureUnit;
  createdAt?: Date;
  acquiredAt: Date;
}

export class ArtworkRepository {
  static async findAll() {
    const artworks = await prisma.artwork.findMany({
      include: {
        artist: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return artworks;
  }

  static async findAllByUser(userId: string) {
    const artworks = await prisma.artwork.findMany({
      where: {
        owner: {
          id: userId,
        },
      },
      include: {
        artist: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return artworks;
  }

  static async findOne(id: string) {
    const artwork = await prisma.artwork.findFirst({
      where: {
        id,
      },
      include: {
        artist: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return artwork;
  }

  static async create(data: CreateArtworkDto) {
    const src = await uploadSupabaseFile('artworks', data.src);

    const artwork = await prisma.artwork.create({
      data: {
        title: data.title,
        description: data.description,
        src,
        alt: data.alt,
        width: data.size.width,
        height: data.size.height,
        depth: data.size.depth,
        unit: data.unit,
        createdAt: data.createdAt,
        acquiredAt: data.acquiredAt,
        owner: {
          connect: {
            id: data.ownerId,
          },
        },
        // TODO: create or connect artist
      },
      include: {
        artist: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return artwork;
  }

  static async delete(artwork: Artwork) {
    const deletedArtwork = await prisma.artwork.delete({
      where: {
        id: artwork.id,
      },
    });
    return deletedArtwork;
  }
}
