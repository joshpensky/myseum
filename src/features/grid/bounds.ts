import { Dimensions, Position } from '@src/types';

export interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const isInBounds = (item: { position: Position; size?: Dimensions }, bounds: Bounds) =>
  // Check if X is greater than left bound
  item.position.x >= bounds.left &&
  // Check if X+width is less than right bound
  item.position.x + (item.size?.width ?? 0) <= bounds.right &&
  // Check if Y is greater than top bound
  item.position.y >= bounds.top &&
  // Check if Y+height is less than bottom bound
  item.position.y + (item.size?.height ?? 0) <= bounds.bottom;
