import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { Museum, User } from '@prisma/client';
import { GalleryBlockProps } from '@src/components/MuseumMap/GalleryBlock';

export interface MuseumContextValue {
  basePath: string;
  museum: Museum & {
    galleries: GalleryBlockProps['gallery'][];
    curator: User;
  };
  setMuseum: Dispatch<SetStateAction<MuseumContextValue['museum']>>;
}
export const MuseumContext = createContext<MuseumContextValue | null>(null);

interface MuseumProviderProps {
  basePath: string;
  children: ReactNode | ((context: MuseumContextValue) => ReactNode);
  museum: MuseumContextValue['museum'];
}
export const MuseumProvider = ({
  basePath,
  children,
  museum: initialMuseum,
}: MuseumProviderProps) => {
  const museumCtx = useContext(MuseumContext);

  const [museum, setMuseum] = useState(initialMuseum);

  const value = museumCtx ?? { basePath, museum, setMuseum };

  return (
    <MuseumContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </MuseumContext.Provider>
  );
};

export const useMuseum = (): MuseumContextValue => {
  const museumCtx = useContext(MuseumContext);
  if (!museumCtx) {
    throw new Error('Hook `useMuseum` must be used within `MuseumProvider`.');
  }
  return museumCtx;
};
