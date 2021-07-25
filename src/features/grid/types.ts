export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type ItemError = 'overlapping' | 'out-of-bounds';

export type MoveControllerType = 'mouse' | 'keyboard' | 'touch';
