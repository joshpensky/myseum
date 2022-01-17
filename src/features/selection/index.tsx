import { theme } from 'twin.macro';
import { Position } from '@src/types';
import { GeometryUtils } from '@src/utils/GeometryUtils';

export const LAYER_COLORS = [
  theme`colors.blue.500`,
  theme`colors.magenta.500`,
  theme`colors.yellow.500`,
];

export type SelectionEditorPath = [Position, Position, Position, Position];

export interface SelectionEditorSnapshot {
  outline: SelectionEditorPath;
  inner?: SelectionEditorPath;
}

export interface SelectionEditorMovePointPayload {
  /**
   * The path type to update.
   */
  path: 'outline' | 'inner';
  /**
   * The point index on the path to update (from 0-3).
   */
  pointIndex: number;
  /**
   * A callback function that determines the new point position.
   *
   * @param from the position of the point in the current snapshot
   * @returns the moved point position
   */
  move(from: Position): Position;
}

export type SelectionEditorAction =
  | {
      type: 'MOVE_POINT';
      payload: SelectionEditorMovePointPayload;
    }
  | {
      type: 'ADD_INNER_PATH';
    };

export class SelectionEditorState {
  private static DEFAULT_INITIAL_SNAPSHOT: SelectionEditorSnapshot = {
    outline: [
      { x: 0, y: 0 }, // top-left
      { x: 1, y: 0 }, // top-right
      { x: 1, y: 1 }, // bottom-right
      { x: 0, y: 1 }, // bottom-left
    ],
  };

  private history: SelectionEditorSnapshot[] = [SelectionEditorState.DEFAULT_INITIAL_SNAPSHOT];
  private snapshotIndex = 0;

  private constructor() {
    // Prevent public constructor (must use .create(...))
  }

  /**
   * Create a new editor state, with an optional initial snapshot.
   *
   * @param initialSnapshot the initial state snapshot
   * @returns the new editor state
   */
  static create(initialSnapshot?: SelectionEditorSnapshot) {
    const editor = new SelectionEditorState();
    if (initialSnapshot) {
      editor.history = [initialSnapshot]; // TODO: deep copy?
    }
    return editor;
  }

  /**
   * Deep copies an existing editor state (for immutability).
   *
   * @param state the editor state to copy
   * @returns the copied state
   */
  private static copy(state: SelectionEditorState) {
    const newState = new SelectionEditorState();
    newState.history = state.history; // TODO: deep copy
    newState.snapshotIndex = state.snapshotIndex;
    return newState;
  }

  /**
   * Gets the current editor revision.
   */
  get current() {
    return this.history[this.snapshotIndex];
  }

  /**
   * Sets the next editor revision.
   */
  private set current(nextValue) {
    this.history[this.snapshotIndex] = nextValue;
  }

  /**
   * Checks whether the editor is fresh, i.e. has had no changes
   */
  get isFresh() {
    // TODO: better checks — what if there's history?
    return (
      !this.current.inner &&
      this.current.outline.every(
        (point, index) =>
          point.x === SelectionEditorState.DEFAULT_INITIAL_SNAPSHOT.outline[index].x &&
          point.y === SelectionEditorState.DEFAULT_INITIAL_SNAPSHOT.outline[index].y,
      )
    );
  }

  /**
   * Travels back to the previous revision in history.
   *
   * @param state the editor state to update
   * @returns the updated state
   */
  static undo(state: SelectionEditorState) {
    const newState = SelectionEditorState.copy(state);

    if (newState.snapshotIndex > 0) {
      newState.snapshotIndex -= 1;
    }

    return newState;
  }

  /**
   * Travels forward to the next revision in history.
   *
   * @param state the editor state to update
   * @returns the updated state
   */
  static redo(state: SelectionEditorState) {
    const newState = SelectionEditorState.copy(state);

    if (newState.snapshotIndex < newState.history.length - 1) {
      newState.snapshotIndex += 1;
    }

    return newState;
  }

  /**
   * Saves the current revision in history, and creates a copy for new commits.
   *
   * @param state the editor state to update
   * @returns the updated state
   */
  static save(state: SelectionEditorState) {
    const newState = SelectionEditorState.copy(state);

    // Keep history up to and including to the current index
    const revisions = newState.history.slice(0, newState.snapshotIndex + 1);
    // Duplicate the current history item
    newState.history = [
      ...revisions,
      {
        outline: [...newState.current.outline],
        inner: newState.current.inner ? [...newState.current.inner] : undefined,
      },
    ];
    // Update the index
    newState.snapshotIndex = newState.history.length - 1;

    return newState;
  }

  /**
   * Commits an action to the current state snapshot.
   *
   * @param state the editor state to update
   * @param action the action to apply
   * @returns the updated state
   */
  static commit(state: SelectionEditorState, action: SelectionEditorAction) {
    const newState = SelectionEditorState.copy(state);

    switch (action.type) {
      case 'MOVE_POINT': {
        newState.commitMovePointAction(action.payload);
        break;
      }

      case 'ADD_INNER_PATH': {
        newState.commitAddInnerPathAction();
        break;
      }

      default: {
        throw new Error('Unknown action.');
      }
    }

    return newState;
  }

  /**
   * Adds an inner path to the current snapshot, if one doesn't already exist.
   */
  private commitAddInnerPathAction() {
    if (this.current.inner) {
      throw new Error('Inner path already exists.');
    }

    const centerPoint = GeometryUtils.findConvexQuadrilateralCenter(this.current.outline);
    const innerPath = GeometryUtils.scalePolygonAroundPoint(
      this.current.outline,
      centerPoint,
      0.95, // Scales the outline path down 5%
    );

    this.current.inner = innerPath;
  }

  /**
   * Moves a point on a given path to a given position.
   *
   * @param payload the action payload
   */
  private commitMovePointAction(payload: SelectionEditorMovePointPayload) {
    const { path: type, pointIndex, move } = payload;

    let path = this.current[type];
    if (!path) {
      throw new Error('Path does not exist.');
    }
    // Shallow copy of path
    path = [...path] as SelectionEditorPath;

    // Update point position on path
    const unboundPosition = move(path[pointIndex]);
    const position: Position = {
      x: Math.min(1, Math.max(0, unboundPosition.x)),
      y: Math.min(1, Math.max(0, unboundPosition.y)),
    };
    path[pointIndex] = position;

    const isPathValid = GeometryUtils.isConvexQuadrilateral(path);
    if (!isPathValid) {
      // Offset the invalidating point to reform a convex quadrilateral
      path[pointIndex] = GeometryUtils.fixConvexQuadrilateral(path, pointIndex, 0.0025);
    }

    switch (type) {
      case 'outline': {
        this.current.outline = path;
        if (this.current.inner) {
          // Fit inner layer inside the outline
          this.current.inner = GeometryUtils.fitConvexQuadrilateralInAnother(
            this.current.inner,
            path,
          );
        }
        break;
      }

      case 'inner': {
        const isPointInsideOutline = GeometryUtils.isPointInPolygon(position, this.current.outline);
        if (!isPointInsideOutline) {
          // if point is outside frame, find closest point on frame to map to
          path[pointIndex] = GeometryUtils.findNearestPointOnPolygon(
            position,
            this.current.outline,
          );
        }
        this.current.inner = path;
        break;
      }

      default: {
        throw new Error('Path does not exist.');
      }
    }
  }
}
