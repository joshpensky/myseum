import { MeasureUnit } from '@prisma/client';
import { assign, createMachine, State } from 'xstate';
import type { SelectionEditorPath } from '@src/features/selection';

//////////////////////////
// Context
//////////////////////////

export interface DimensionsContext {
  width: number;
  height: number;
  depth: number;
  unit: MeasureUnit;
}

export interface SelectionContext {
  path: SelectionEditorPath;
  preview: string;
}

export interface DetailsContext {
  title: string;
  artist?: {
    id?: string;
    name: string;
  };
  description: string;
  altText: string;
  createdAt?: Date;
  acquiredAt: Date;
}

export interface EditArtworkContext {
  id: string;
  dimensions: DimensionsContext;
  selection: SelectionContext;
  details: DetailsContext;
}

//////////////////////////
// Events
//////////////////////////

export interface ResetEvent {
  type: 'RESET';
  context: EditArtworkContext;
}

export interface GoBackEvent {
  type: 'GO_BACK';
}

export interface ConfirmDimensionsEvent {
  type: 'CONFIRM_DIMENSIONS';
  dimensions: DimensionsContext;
}

export interface ConfirmSelectionEvent {
  type: 'CONFIRM_SELECTION';
  selection: SelectionContext;
}

export interface ConfirmDetailsEvent {
  type: 'CONFIRM_DETAILS';
  details: DetailsContext;
}

export interface EditDimensionsEvent {
  type: 'EDIT_DIMENSIONS';
}

export interface EditSelectionEvent {
  type: 'EDIT_SELECTION';
}

export interface EditDetailsEvent {
  type: 'EDIT_DETAILS';
}

export type EditArtworkEvent =
  | ResetEvent
  | GoBackEvent
  | ConfirmDimensionsEvent
  | ConfirmSelectionEvent
  | ConfirmDetailsEvent
  | EditDimensionsEvent
  | EditSelectionEvent
  | EditDetailsEvent;

//////////////////////////
// Typestates
//////////////////////////

export interface DimensionsTypestate {
  value: 'dimensions';
  context: EditArtworkContext;
}

export interface SelectionTypestate {
  value: 'selection';
  context: EditArtworkContext;
}

export interface DetailsTypestate {
  value: 'details';
  context: EditArtworkContext;
}

export interface ReviewTypestate {
  value: 'review';
  context: EditArtworkContext;
}

export type EditArtworkTypestate =
  | DimensionsTypestate
  | SelectionTypestate
  | DetailsTypestate
  | ReviewTypestate;

///////////////////////
// Utility Types
///////////////////////

export type EditArtworkStateValue = EditArtworkTypestate['value'];

export interface EditArtworkTypestateMap {
  dimensions: DimensionsTypestate;
  selection: SelectionTypestate;
  details: DetailsTypestate;
  review: ReviewTypestate;
}

export type EditArtworkState<Value extends EditArtworkStateValue> = State<
  EditArtworkTypestateMap[Value]['context'],
  EditArtworkEvent,
  any,
  EditArtworkTypestate
> & {
  value: Value;
};

///////////////////////
// Machine
///////////////////////

export const editArtworkMachine = createMachine<
  EditArtworkContext,
  EditArtworkEvent,
  EditArtworkTypestate
>({
  id: 'form',
  context: ({
    id: undefined,
    dimensions: undefined,
    selection: undefined,
    details: undefined,
  } as unknown) as EditArtworkContext, // context will be defined in useMachine!
  initial: 'review',
  states: {
    review: {
      on: {
        RESET: {
          actions: assign((ctx, evt) => evt.context),
        },
        EDIT_DIMENSIONS: {
          target: 'dimensions',
        },
        EDIT_SELECTION: {
          target: 'selection',
        },
        EDIT_DETAILS: {
          target: 'details',
        },
      },
    },
    dimensions: {
      on: {
        RESET: {
          target: 'review',
          actions: assign((ctx, evt) => evt.context),
        },
        GO_BACK: {
          target: 'review',
        },
        CONFIRM_DIMENSIONS: {
          target: 'review',
          actions: assign((ctx, evt) => ({
            dimensions: evt.dimensions,
          })),
        },
      },
    },
    selection: {
      on: {
        RESET: {
          target: 'review',
          actions: assign((ctx, evt) => evt.context),
        },
        GO_BACK: {
          target: 'review',
        },
        CONFIRM_SELECTION: {
          target: 'review',
          actions: assign((ctx, evt) => ({
            selection: evt.selection,
          })),
        },
      },
    },
    details: {
      on: {
        RESET: {
          target: 'review',
          actions: assign((ctx, evt) => evt.context),
        },
        GO_BACK: {
          target: 'review',
        },
        CONFIRM_DETAILS: {
          target: 'review',
          actions: assign((ctx, evt) => ({
            details: evt.details,
          })),
        },
      },
    },
  },
});
