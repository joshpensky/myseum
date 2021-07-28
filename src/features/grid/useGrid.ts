import { createContext, useContext } from 'react';
import { Dimensions } from '@src/types';

interface GridContextValue {
  size: Dimensions;
  unitPx: number;
  readOnly: boolean;
}

export const GridContext = createContext<GridContextValue | null>(null);

export function useGrid() {
  const value = useContext(GridContext);
  if (!value) {
    throw new Error('Must wrap in GridContext...');
  }
  return value;
}
