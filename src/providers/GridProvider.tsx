import { createContext, PropsWithChildren, useContext } from 'react';

export type GridContextValue = {
  itemSize: number;
};
export const GridContext = createContext<GridContextValue | null>(null);

export type GridProviderProps = GridContextValue;
export const GridProvider = ({ children, itemSize }: PropsWithChildren<GridProviderProps>) => (
  <GridContext.Provider value={{ itemSize }}>{children}</GridContext.Provider>
);

export const useGrid = () => {
  const value = useContext(GridContext);
  if (!value) {
    throw new Error('Cannot call useSWRConfig outside of SWRProvider context.');
  }
  return value;
};
