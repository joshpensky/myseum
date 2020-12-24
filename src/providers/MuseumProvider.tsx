import { Museum } from '@src/types';
import { createContext, ReactNode, useContext } from 'react';

export type MuseumContextValue = {
  museum: Museum;
};
export const MuseumContext = createContext<MuseumContextValue | null>(null);

type MuseumProviderProps = {
  children: ReactNode;
  museum: Museum;
};
export const MuseumProvider = ({ children, museum }: MuseumProviderProps) => (
  <MuseumContext.Provider value={{ museum }}>{children}</MuseumContext.Provider>
);

export const useMuseum = () => {
  const value = useContext(MuseumContext);
  if (!value) {
    throw new Error('Cannot call useMuseum outside of MuseumProvider context.');
  }
  return value;
};
