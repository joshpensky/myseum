import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { SelectionEditor } from '@src/hooks/useSelectionEditor';
import { ArtworkDetails, Measurement } from './types';
import { Dimensions } from '@src/types';

export type AddArtworkContextValue = {
  actualDimensions: Dimensions;
  details: ArtworkDetails;
  editor: SelectionEditor;
  frameId?: number;
  image?: HTMLImageElement;
  isSubmitting: boolean;
  measurement: Measurement;
  setActualDimensions: Dispatch<SetStateAction<Dimensions>>;
  setDetails: Dispatch<SetStateAction<ArtworkDetails>>;
  setFrameId: Dispatch<SetStateAction<number | undefined>>;
  setImage: Dispatch<SetStateAction<HTMLImageElement | undefined>>;
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
