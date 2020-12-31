import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Position } from '@src/types';
import { GeometryUtils } from '@src/utils/GeometryUtils';

export type SelectionEditorPoints = [Position, Position, Position, Position];
export type SelectionEditorState = 'idle' | 'editing';

export type SelectionEditor = {
  isValid: boolean;
  onPointsChange: Dispatch<SetStateAction<SelectionEditorPoints>>;
  onStateChange: Dispatch<SetStateAction<SelectionEditorState>>;
  points: SelectionEditorPoints;
  state: SelectionEditorState;
};

export const useSelectionEditor = (): SelectionEditor => {
  const [points, setPoints] = useState<SelectionEditorPoints>([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]);

  // Checks whether the points form a valid convex quadrilateral selection
  const isSelectionValid = useMemo(() => GeometryUtils.isConvexQuadrilateral(points), [points]);

  const [state, setState] = useState<SelectionEditorState>('idle');

  return {
    isValid: isSelectionValid,
    onPointsChange: setPoints,
    onStateChange: setState,
    points,
    state,
  };
};
