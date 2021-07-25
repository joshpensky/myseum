import { Bounds, Position, Size } from './types';

export const isInBounds = (item: { position: Position; size?: Size }, bounds: Bounds) =>
  // Check if X is greater than left bound
  item.position.x >= bounds.left &&
  // Check if X+width is less than right bound
  item.position.x + (item.size?.width ?? 0) <= bounds.right &&
  // Check if Y is greater than top bound
  item.position.y >= bounds.top &&
  // Check if Y+height is less than bottom bound
  item.position.y + (item.size?.height ?? 0) <= bounds.bottom;
