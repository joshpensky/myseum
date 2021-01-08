import { useState } from 'react';
import { Position } from '@src/types';

export type SelectionEditorPoints = [Position, Position, Position, Position];

export type SelectionEditorLayer = {
  name?: string;
  points: SelectionEditorPoints;
};

export type SelectionEditor = {
  history: {
    lap(): void;
    redo(): void;
    undo(): void;
    squash(): void;
    restart(): void;
  };
  layers: SelectionEditorLayer[];
  setLayers(
    layers:
      | SelectionEditorLayer[]
      | ((currLayers: SelectionEditorLayer[]) => SelectionEditorLayer[]),
    lap?: boolean,
  ): void;
};

export const useSelectionEditor = (initialState?: SelectionEditorLayer[]): SelectionEditor => {
  // A log of editor history
  const [history, setHistory] = useState<SelectionEditorLayer[][]>(() => {
    if (initialState) {
      return [initialState];
    }
    return [
      [
        {
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
          ],
        },
      ],
    ];
  });
  // The current index we're viewing in history ("time travel" state)
  const [historyIndex, setHistoryIndex] = useState(0);
  // The points at our current slice of history
  const layers = history[historyIndex];

  // Updates the layers in history
  const setLayers = (
    layers:
      | SelectionEditorLayer[]
      | ((currLayers: SelectionEditorLayer[]) => SelectionEditorLayer[]),
    lap?: boolean,
  ) => {
    // Get the updated layers' values
    let newLayers: SelectionEditorLayer[];
    if (typeof layers === 'function') {
      newLayers = layers(history[historyIndex]);
    } else {
      newLayers = layers;
    }

    // If lapping, this change will be recorded as a new entry
    if (lap) {
      const newHistory = [...history.slice(0, historyIndex + 1), newLayers];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return;
    }

    // Otherwise, it will override the current entry
    const newHistory = [...history.slice(0, historyIndex), newLayers];
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
    layers,
    setLayers,
  };
};
