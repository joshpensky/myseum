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
  history: {
    lap(): void;
    redo(): void;
    undo(): void;
  };
};

export const useSelectionEditor = (): SelectionEditor => {
  const [history, setHistory] = useState<SelectionEditorPoints[]>([
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
  ]);

  const [historyIndex, setHistoryIndex] = useState(0);

  const points = history[historyIndex];

  const onPointsChange = (
    points: SelectionEditorPoints | ((currPoints: SelectionEditorPoints) => SelectionEditorPoints),
  ) => {
    let newPoints: SelectionEditorPoints;
    if (typeof points === 'function') {
      newPoints = points(history[historyIndex]);
    } else {
      newPoints = points;
    }
    const newHistory = [...history.slice(0, historyIndex), newPoints];
    setHistory(newHistory);
  };

  // Create a new entry in the history, by copying the current index
  // Will also slice any undo'd entries
  const lap = () => {
    const newHistory = [...history.slice(0, historyIndex + 1), history[historyIndex]];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Goes back to the previous entry in history, if available
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Moves forward to the next entry in history, if available
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Checks whether the points form a valid convex quadrilateral selection
  const isSelectionValid = useMemo(() => GeometryUtils.isConvexQuadrilateral(points), [points]);

  const [state, setState] = useState<SelectionEditorState>('idle');

  return {
    isValid: isSelectionValid,
    onPointsChange,
    onStateChange: setState,
    points,
    state,
    history: {
      undo,
      redo,
      lap,
    },
  };
};
