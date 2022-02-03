import { Frame, Gallery, GalleryColor, Matting, PlacedArtwork } from '@prisma/client';
import { Dimensions3D, Position } from '@src/types';
import { ArtworkDto, ArtworkSerializer, PrismaArtwork } from './artwork.serializer';
import { FrameDto, FrameSerializer } from './frame.serializer';
import { MuseumDto, MuseumSerializer, PrismaMuseum } from './museum.serializer';

export interface PrismaPlacedArtwork extends PlacedArtwork {
  artwork: PrismaArtwork;
  frame: Frame | null;
}

export interface PrismaGallery extends Gallery {
  artworks: PrismaPlacedArtwork[];
  museum: PrismaMuseum;
}

export interface PlacedArtworkDto {
  artwork: ArtworkDto;
  frame: FrameDto | null;
  framingOptions: {
    isScaled: boolean;
    scaling: number;
    matting: Matting;
  };
  position: Position;
  size: Dimensions3D;
  addedAt: Date;
  modifiedAt: Date;
}

export interface GalleryDto {
  id: number;
  museumId: number;
  name: string;
  description: string;
  color: GalleryColor;
  height: number;
  artworks: PlacedArtworkDto[];
  museum: MuseumDto;
  addedAt: Date;
  modifiedAt: Date;
}

export class GallerySerializer {
  static serialize(gallery: PrismaGallery): GalleryDto {
    return {
      id: gallery.id,
      museumId: gallery.museumId,
      name: gallery.name,
      description: gallery.description,
      color: gallery.color,
      height: gallery.height,
      artworks: gallery.artworks.map(galleryArtwork =>
        GallerySerializer.serializeArtwork(galleryArtwork),
      ),
      museum: MuseumSerializer.serialize(gallery.museum),
      addedAt: gallery.addedAt,
      modifiedAt: gallery.modifiedAt,
    };
  }

  static serializeArtwork(placedArtwork: PrismaPlacedArtwork): PlacedArtworkDto {
    const artwork = ArtworkSerializer.serialize(placedArtwork.artwork);
    let frame: PlacedArtworkDto['frame'] = null;
    if (placedArtwork.frame) {
      frame = FrameSerializer.serialize(placedArtwork.frame);
    }

    return {
      artwork,
      frame,
      framingOptions: {
        isScaled: placedArtwork.isScaled,
        scaling: placedArtwork.scaling,
        matting: placedArtwork.matting,
      },
      position: {
        x: placedArtwork.posX,
        y: placedArtwork.posY,
      },
      size: frame?.size ?? artwork.size,
      addedAt: placedArtwork.addedAt,
      modifiedAt: placedArtwork.modifiedAt,
    };
  }
}
