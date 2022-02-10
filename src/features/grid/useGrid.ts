import {
  createContext,
  Dispatch,
  MutableRefObject,
  ReactNode,
  RefObject,
  SetStateAction,
  useContext,
} from 'react';
import { Dimensions } from '@src/types';
import { GridItemDto, GridRenderItemProps } from './GridRoot';

interface GridContextValue {
  items: GridItemDto[];
  projectedItem: GridItemDto | null;
  setProjectedItem: Dispatch<SetStateAction<GridItemDto | null>>;
  getItemId(item: GridItemDto): string;
  onItemChange?: ((index: number, value: GridItemDto) => void) | false;
  onSizeChange?(value: Dimensions): void;
  renderItem(item: GridItemDto, props: GridRenderItemProps, index: number): ReactNode;
  // more
  size: Dimensions;
  unitPx: number;
  step: number;
  preview: boolean;
  rootElRef: RefObject<HTMLDivElement>;
  viewportRef: MutableRefObject<Element | undefined>;
  gridRef: RefObject<HTMLDivElement>;
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
