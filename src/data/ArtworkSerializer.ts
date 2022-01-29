import { Artist, Artwork, Frame, MeasureUnit } from '@prisma/client';
import { Dimensions3D } from '@src/types';
import { FrameDto, FrameSerializer } from './FrameSerializer';

export interface PrismaArtwork extends Artwork {
  frame: Frame | null;
  artist: Artist | null;
}

export interface ArtworkDto {
  id: number;
  title: string;
  description: string;
  src: string;
  alt: string;
  size: Dimensions3D;
  fullSize: Dimensions3D;
  unit: MeasureUnit;
  frame?: FrameDto;
  artist?: Artist;
  createdAt?: Date;
  acquiredAt: Date;
}

export class ArtworkSerializer {
  static serialize(artwork: PrismaArtwork): ArtworkDto {
    const size: Dimensions3D = {
      width: artwork.width,
      height: artwork.height,
      depth: 0,
    };

    let frame: FrameDto | undefined = undefined;
    if (artwork.frame) {
      frame = FrameSerializer.serialize(artwork.frame);
    }

    return {
      id: artwork.id,
      title: artwork.title,
      description: artwork.description,
      src: artwork.src,
      alt: artwork.alt,
      size,
      fullSize: {
        width: Math.ceil(frame?.size.width ?? size.width),
        height: Math.ceil(frame?.size.height ?? size.height),
        depth: frame?.size.depth ?? 0,
      },
      unit: artwork.unit,
      frame,
      artist: artwork.artist ?? undefined,
      createdAt: artwork.createdAt ?? undefined,
      acquiredAt: artwork.acquiredAt,
    };
  }
}