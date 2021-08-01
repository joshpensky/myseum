import { Artist, Artwork, Frame } from '@prisma/client';
import { Dimensions, Dimensions3D } from '@src/types';
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
  size: Dimensions;
  fullSize: Dimensions3D;
  frame?: FrameDto;
  artist?: Artist;
  createdAt: Date;
  acquiredAt: Date;
}

export class ArtworkSerializer {
  static serialize(artwork: PrismaArtwork): ArtworkDto {
    const size: Dimensions = {
      width: artwork.width,
      height: artwork.height,
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
      frame,
      artist: artwork.artist ?? undefined,
      createdAt: artwork.createdAt,
      acquiredAt: artwork.acquiredAt,
    };
  }
}
