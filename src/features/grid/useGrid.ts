import { createContext, useContext } from 'react';
import { Dimensions } from '@src/types';

interface GridContextValue {
  size: Dimensions;
  unitPx: number;
  readOnly: boolean;
}

export const GridContext = createContext<GridContextValue | null>(null);

export function useGrid(): GridContextValue;
export function useGrid(__dangerous_useOutsideContext: true): GridContextValue | null;
export function useGrid(__dangerous_useOutsideContext?: true): GridContextValue | null {
  const value = useContext(GridContext);
  if (__dangerous_useOutsideContext) {
    return value;
  }

  if (!value) {
    throw new Error('Must wrap in GridContext...');
  }
  return value;
}
