import { Dimensions, Measurement } from '@src/types';

export type Preset = {
  type: 'custom' | 'a4' | 'poster';
  display: string;
  dimensions: Dimensions;
  measurement: Measurement;
};

export type ArtworkDetails = {
  title: string;
  artist: string;
  description: string;
  createdAt: number;
  acquiredAt: number;
};
