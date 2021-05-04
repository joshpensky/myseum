import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { Gallery, Museum, User } from '@prisma/client';

export interface MuseumContextValue {
  museum: Museum & {
    galleries: Gallery[];
    curator: User;
  };
  setMuseum: Dispatch<SetStateAction<MuseumContextValue['museum']>>;
}
export const MuseumContext = createContext<MuseumContextValue | null>(null);

interface MuseumProviderProps {
  children: ReactNode | ((museum: MuseumContextValue['museum']) => ReactNode);
  museum: MuseumContextValue['museum'];
}
export const MuseumProvider = ({ children, museum: initialMuseum }: MuseumProviderProps) => {
  const museumCtx = useContext(MuseumContext);

  const [museum, setMuseum] = useState(initialMuseum);

  return (
    <MuseumContext.Provider value={museumCtx ?? { museum, setMuseum }}>
      {typeof children === 'function' ? children(museum) : children}
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
