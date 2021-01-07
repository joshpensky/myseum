import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { SelectionEditor } from '@src/hooks/useSelectionEditor';
import { Dimensions, Measurement } from '@src/types';

export type AddFrameContextValue = {
  actualDimensions: Dimensions;
  description: string;
  editor: SelectionEditor;
  image?: HTMLImageElement;
  isSubmitting: boolean;
  measurement: Measurement;
  setActualDimensions: Dispatch<SetStateAction<Dimensions>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setImage: Dispatch<SetStateAction<HTMLImageElement | undefined>>;
  setMeasurement: Dispatch<SetStateAction<Measurement>>;
};

export const AddFrameContext = createContext<AddFrameContextValue | null>(null);

export const useAddFrameContext = () => {
  const value = useContext(AddFrameContext);
  if (!value) {
    throw new Error('useAddFrameContext cannot be used outside of context of AddFrameProvider.');
  }
  return value;
};
