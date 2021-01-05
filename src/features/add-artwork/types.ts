import { Dimensions } from '@src/types';

export type Measurement = 'inch' | 'cm' | 'mm';

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
