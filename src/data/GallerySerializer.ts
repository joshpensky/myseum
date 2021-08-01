import { Gallery, GalleryArtwork, GalleryColor } from '@prisma/client';
import { Position } from '@src/types';
import { ArtworkDto, ArtworkSerializer, PrismaArtwork } from './ArtworkSerializer';

export interface PrismaGalleryArtwork extends GalleryArtwork {
  artwork: PrismaArtwork;
}

export interface PrismaGallery extends Gallery {
  artworks: PrismaGalleryArtwork[];
}

export interface GalleryArtworkDto {
  artwork: ArtworkDto;
  position: Position;
}

export interface GalleryDto {
  id: number;
  museumId: number;
  name: string;
  color: GalleryColor;
  height: number;
  position: Position;
  artworks: GalleryArtworkDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class GallerySerializer {
  static serialize(gallery: PrismaGallery): GalleryDto {
    return {
      id: gallery.id,
      museumId: gallery.museumId,
      name: gallery.name,
      color: gallery.color,
      height: gallery.height,
      position: {
        x: gallery.xPosition,
        y: gallery.yPosition,
      },
      artworks: gallery.artworks.map(galleryArtwork =>
        GallerySerializer.serializeArtwork(galleryArtwork),
      ),
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
    };
  }

  static serializeArtwork(galleryArtwork: PrismaGalleryArtwork): GalleryArtworkDto {
    const artwork = ArtworkSerializer.serialize(galleryArtwork.artwork);
    return {
      artwork,
      position: {
        x: galleryArtwork.xPosition,
        y: galleryArtwork.yPosition,
      },
    };
  }
}
