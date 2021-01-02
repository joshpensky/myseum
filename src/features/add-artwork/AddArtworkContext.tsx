import { SelectionEditor } from '@src/hooks/useSelectionEditor';
import { Dimensions } from '@src/types';
import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { Measurement } from './types';

export type AddArtworkContextValue = {
  actualDimensions: Dimensions;
  editor: SelectionEditor;
  image?: HTMLImageElement;
  isNextDisabled: boolean;
  measurement: Measurement;
  setActualDimensions: Dispatch<SetStateAction<Dimensions>>;
  setImage: Dispatch<SetStateAction<HTMLImageElement | undefined>>;
  setIsNextDisabled: Dispatch<SetStateAction<boolean>>;
  setMeasurement: Dispatch<SetStateAction<Measurement>>;
};

export const AddArtworkContext = createContext<AddArtworkContextValue | null>(null);

export const useAddArtworkContext = () => {
  const value = useContext(AddArtworkContext);
  if (!value) {
    throw new Error(
      'useAddArtworkContext cannot be used outside of context of AddArtworkProvider.',
    );
  }
  return value;
};
