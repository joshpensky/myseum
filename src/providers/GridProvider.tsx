import { createContext, PropsWithChildren, useContext } from 'react';

export type GridContextValue = {
  itemSize: number;
  columns: number;
  rows: number;
  percentScrolled: number;
  percentVisible: number;
};
export const GridContext = createContext<GridContextValue | null>(null);

export type GridProviderProps = GridContextValue;
export const GridProvider = ({
  children,
  itemSize,
  columns,
  rows,
  percentScrolled,
  percentVisible,
}: PropsWithChildren<GridProviderProps>) => (
  <GridContext.Provider value={{ itemSize, columns, rows, percentScrolled, percentVisible }}>
    {children}
  </GridContext.Provider>
);

export const useGrid = () => useContext(GridContext);
