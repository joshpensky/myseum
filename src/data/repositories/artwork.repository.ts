import { MeasureUnit } from '@prisma/client';
import { decode } from 'base64-arraybuffer';
import * as uuid from 'uuid';
import { prisma } from '@src/data/prisma';
import { supabase } from '@src/data/supabase';
import { Dimensions3D } from '@src/types';

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

  static async create(data: CreateArtworkDto) {
    // example of data.src: 'type:<contentType>;base64,<data>'
    const fileContentType = data.src.slice(0, data.src.indexOf(';')).replace('data:', '');
    const fileBase64Data = data.src.replace(`data:${fileContentType};base64,`, '');
    const fileExtension = fileContentType.replace('image/', '');
    const fileName = `${uuid.v4()}.${fileExtension}`;
    const upload = await supabase.storage
      .from('artworks')
      .upload(fileName, decode(fileBase64Data), {
        contentType: fileContentType,
      });

    if (!upload.data || upload.error) {
      throw upload.error ?? new Error('Artwork unable to upload.');
    }

    const artwork = await prisma.artwork.create({
      data: {
        title: data.title,
        description: data.description,
        src: fileName,
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
}
