import {
  createContext,
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { MuseumDto } from '@src/data/MuseumSerializer';

export interface MuseumContextValue {
  museum: MuseumDto;
  setMuseum: Dispatch<SetStateAction<MuseumContextValue['museum']>>;
}
export const MuseumContext = createContext<MuseumContextValue | null>(null);

interface MuseumProviderProps {
  children: ReactNode | ((context: MuseumContextValue) => ReactNode);
  museum: MuseumContextValue['museum'];
}
export const MuseumProvider = ({
  children,
  museum: initialMuseum,
}: PropsWithChildren<MuseumProviderProps>) => {
  const museumCtx = useContext(MuseumContext);

  const [museum, setMuseum] = useState(initialMuseum);

  const value = museumCtx ?? { museum, setMuseum };

  return <MuseumContext.Provider value={value}>{children}</MuseumContext.Provider>;
};

export const useMuseum = (): MuseumContextValue => {
  const museumCtx = useContext(MuseumContext);
  if (!museumCtx) {
    throw new Error('Hook `useMuseum` must be used within `MuseumProvider`.');
  }
  return museumCtx;
};
