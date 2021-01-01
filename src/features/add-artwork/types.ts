import { Dimensions } from '@src/types';
import { ComponentType } from 'react';

export type Measurement = 'inch' | 'cm' | 'mm';

export type Preset = {
  type: 'custom' | 'a4' | 'poster';
  display: string;
  dimensions: Dimensions;
  measurement: Measurement;
};

export type AddArtworkStep = {
  Main: ComponentType;
  Rail: ComponentType;
};
