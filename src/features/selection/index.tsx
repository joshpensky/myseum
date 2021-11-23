import { theme } from 'twin.macro';
import { Position } from '@src/types';
import { GeometryUtils } from '@src/utils/GeometryUtils';

export const LAYER_COLORS = [
  theme`colors.blue.500`,
  theme`colors.magenta.500`,
  theme`colors.yellow.500`,
];

export type SelectionEditorPath = [Position, Position, Position, Position];

// rename to SelectionEditorSnapshot
export interface SelectionEditorSnapshot {
  outline: SelectionEditorPath;
  inner?: SelectionEditorPath;
}

export interface SelectionEditorMovePointPayload {
  path: 'outline' | 'inner';
  pointIndex: 0 | 1 | 2 | 3;
  move(from: Position): Position;
}

// union
export type SelectionEditorAction =
  | {
      type: 'MOVE_POINT';
      payload: SelectionEditorMovePointPayload;
    }
  | {
      type: 'ADD_INNER_PATH';
    };

// rename to SelectionEditorSnapshot
export class SelectionEditorState {
  private static DEFAULT_INITIAL_SNAPSHOT: SelectionEditorSnapshot = {
    outline: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
  };

  private history: SelectionEditorSnapshot[] = [SelectionEditorState.DEFAULT_INITIAL_SNAPSHOT];
  private revisionIndex = 0;

  private constructor() {
    // do nothing
  }

  static create(initialSnapshot?: SelectionEditorSnapshot) {
    const editor = new SelectionEditorState();
    if (initialSnapshot) {
      editor.history = [initialSnapshot]; // TODO: deep copy?
    }
    return editor;
  }

  private static copy(editor: SelectionEditorState) {
    const editorCopy = new SelectionEditorState();
    editorCopy.history = editor.history; // TODO: deep copy
    editorCopy.revisionIndex = editor.revisionIndex;
    return editorCopy;
  }

  /**
   * Gets the current editor revision.
   */
  get current() {
    return this.history[this.revisionIndex];
  }

  /**
   * Sets the next editor revision.
   */
  private set current(nextValue) {
    this.history[this.revisionIndex] = nextValue;
  }

  /**
   * Checks whether the editor is fresh, a.k.a has had no changes
   */
  get isFresh() {
    // TODO: better checks—what if there's history?
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
   */
  static undo(editor: SelectionEditorState) {
    const newEditor = SelectionEditorState.copy(editor);

    if (newEditor.revisionIndex > 0) {
      newEditor.revisionIndex -= 1;
    }

    return newEditor;
  }

  /**
   * Travels forward to the next revision in history.
   */
  static redo(editor: SelectionEditorState) {
    const newEditor = SelectionEditorState.copy(editor);

    if (newEditor.revisionIndex < newEditor.history.length - 1) {
      newEditor.revisionIndex += 1;
    }

    return newEditor;
  }

  /**
   * Saves the current revision in history, and creates a copy for new commits.
   */
  static save(editor: SelectionEditorState) {
    const newEditor = SelectionEditorState.copy(editor);

    // Keep history up to and including to the current index
    const revisions = newEditor.history.slice(0, newEditor.revisionIndex + 1);
    // Duplicate the current history item
    newEditor.history = [
      ...revisions,
      {
        outline: [...newEditor.current.outline],
        inner: newEditor.current.inner ? [...newEditor.current.inner] : undefined,
      },
    ];
    // Update the index
    newEditor.revisionIndex = newEditor.history.length - 1;

    return newEditor;
  }

  static commit(editor: SelectionEditorState, action: SelectionEditorAction) {
    const newEditor = SelectionEditorState.copy(editor);

    switch (action.type) {
      case 'MOVE_POINT': {
        newEditor.commitMovePointAction(action.payload);
        break;
      }

      case 'ADD_INNER_PATH': {
        newEditor.commitAddInnerPathAction();
        break;
      }

      default: {
        throw new Error('Unknown action.');
      }
    }

    return newEditor;
  }

  private commitAddInnerPathAction() {
    if (this.current.inner) {
      throw new Error('Inner path already exists.');
    }

    // // Commits must occur on a new revision
    // if (this.revisionIndex === 0) {
    //   this.save();
    // }

    const centerPoint = GeometryUtils.findConvexQuadrilateralCenter(this.current.outline);
    const innerPath = GeometryUtils.scalePolygonAroundPoint(
      this.current.outline,
      centerPoint,
      0.95, // Scales the outline path down 5%
    );

    this.current.inner = innerPath;
  }

  private commitMovePointAction(payload: SelectionEditorMovePointPayload) {
    const { path: type, pointIndex, move } = payload;

    let path = this.current[type];
    if (!path) {
      throw new Error('Path does not exist.');
    }
    // Shallow copy of path
    path = [...path] as SelectionEditorPath;

    // // Commits must occur on a new revision
    // if (this.revisionIndex === 0) {
    //   this.save();
    // }

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
