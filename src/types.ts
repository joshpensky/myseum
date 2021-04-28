import { CSSProp } from 'styled-components';

export type BaseProps = {
  className?: string;
  css?: CSSProp;
};

export type Id = number;

export type Position = {
  x: number;
  y: number;
};

export type Measurement = 'inch' | 'cm' | 'mm';

export type Dimensions = {
  width: number;
  height: number;
};

export type Frame = {
  id: Id;
  src: string;
  description: string;
  dimensions: Dimensions;
  depth: number;
  /**
   * The window is the hole in the frame where artwork can be displayed.
   *
   * It is marked below with X's.
   *
   * ```
   * +----------+
   * |  +----+  |
   * |  |xxxx|  |
   * |  |xxxx|  |
   * |  +----+  |
   * +----------+
   * ```
   */
  window: [Position, Position, Position, Position];
};

export type Artist = {
  id: Id;
  name: string;
};

export type Artwork = {
  id: Id;
  title: string;
  artist: Artist | null;
  description: string;
  src: string;
  alt: string;
  /** The dimensions of the artwork */
  dimensions: Dimensions;
  /** The frame that the artwork is in */
  frame: Frame;
  acquiredAt: Date;
  createdAt: Date;
};

export type ListItem<T> = {
  item: T;
  position: Position;
};

export type GalleryColor = 'mint' | 'pink' | 'navy' | 'paper';

export type Gallery<T = Artwork> = {
  id: Id;
  slug: string;
  name: string;
  color: GalleryColor;
  height: number;
  artworks: ListItem<T>[];
  createdAt: Date;
};

export type Museum<T = Gallery> = {
  id: Id;
  slug: string;
  name: string;
  galleries: ListItem<T>[];
  createdAt: Date;
};

export type MuseumCollectionItem = Artwork & {
  gallery: Omit<Gallery, 'artworks'>;
};
