import { useMemo, useState } from 'react';
import { Position } from '@src/types';
import { GeometryUtils } from '@src/utils/GeometryUtils';

export type SelectionEditorPoints = [Position, Position, Position, Position];

export type SelectionEditor = {
  history: {
    lap(): void;
    redo(): void;
    undo(): void;
    squash(): void;
    restart(): void;
  };
  isValid: boolean;
  points: SelectionEditorPoints;
  setPoints(
    points: SelectionEditorPoints | ((currPoints: SelectionEditorPoints) => SelectionEditorPoints),
    lap?: boolean,
  ): void;
};

export const useSelectionEditor = (initialState?: SelectionEditor): SelectionEditor => {
  // A log of editor history
  const [history, setHistory] = useState<SelectionEditorPoints[]>(() => {
    if (initialState) {
      return [initialState.points];
    }
    return [
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
    ];
  });
  // The current index we're viewing in history ("time travel" state)
  const [historyIndex, setHistoryIndex] = useState(0);
  // The points at our current slice of history
  const points = history[historyIndex];
  // Checks whether the current points form a valid convex quadrilateral selection
  const isSelectionValid = useMemo(() => GeometryUtils.isConvexQuadrilateral(points), [points]);

  // Updates the points in history
  const setPoints = (
    points: SelectionEditorPoints | ((currPoints: SelectionEditorPoints) => SelectionEditorPoints),
    lap?: boolean,
  ) => {
    // Get the updated points values
    let newPoints: SelectionEditorPoints;
    if (typeof points === 'function') {
      newPoints = points(history[historyIndex]);
    } else {
      newPoints = points;
    }

    // If lapping, this change will be recorded as a new entry
    if (lap) {
      const newHistory = [...history.slice(0, historyIndex + 1), newPoints];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return;
    }

    // Otherwise, it will override the current entry
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

  // Squashes history back to one entry
  const squash = () => {
    setHistory([history[historyIndex]]);
    setHistoryIndex(0);
  };

  // Removes all entries except the first
  const restart = () => {
    setHistory([history[0]]);
    setHistoryIndex(0);
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

  return {
    history: {
      undo,
      redo,
      lap,
      squash,
      restart,
    },
    isValid: isSelectionValid,
    points,
    setPoints,
  };
};
