import { createContext, useContext } from 'react';
import { Size } from './types';

interface GridContextValue {
  size: Size;
  unitPx: number;
}

export const GridContext = createContext<GridContextValue | null>(null);

export function useGrid() {
  const value = useContext(GridContext);
  if (!value) {
    throw new Error('Must wrap in GridContext...');
  }
  return value;
}
