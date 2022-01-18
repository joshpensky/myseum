import { assign, createMachine, State } from 'xstate';
import type { SelectionEditorPath } from '@src/features/selection';
import type { Measurement } from '@src/types';

type SemiRequired<Type, Keys extends keyof Type> = Type & Required<Pick<Type, Keys>>;

//////////////////////////
// Context
//////////////////////////

export interface UploadContext {
  image: HTMLImageElement;
}

export interface DimensionsContext {
  width: number;
  height: number;
  unit: Measurement;
}

export interface SelectionContext {
  path: SelectionEditorPath;
  preview: HTMLImageElement;
}

export type FramingContext =
  | {
      hasFrame: true;
      frameId: number;
    }
  | {
      hasFrame: false;
      depth: number;
      unit: Measurement;
    };

export interface DetailsContext {
  title: string;
  artist?: string;
  description: string;
  altText: string;
  createdAt: Date;
  acquiredAt: Date;
}

export interface CreateUpdateArtworkContext {
  upload?: UploadContext;
  dimensions?: DimensionsContext;
  selection?: SelectionContext;
  framing?: FramingContext;
  details?: DetailsContext;
}

//////////////////////////
// Events
//////////////////////////

export interface GoBackEvent {
  type: 'GO_BACK';
}

export interface ConfirmUploadEvent {
  type: 'CONFIRM_UPLOAD';
  upload: UploadContext;
  dimensions: DimensionsContext;
}

export interface ConfirmDimensionsEvent {
  type: 'CONFIRM_DIMENSIONS';
  dimensions: DimensionsContext;
}

export interface ConfirmSelectionEvent {
  type: 'CONFIRM_SELECTION';
  selection: SelectionContext;
}

export interface ConfirmFramingEvent {
  type: 'CONFIRM_FRAMING';
  framing: FramingContext;
}

export interface ConfirmDetailsEvent {
  type: 'CONFIRM_DETAILS';
  details: DetailsContext;
}

export interface ConfirmReviewEvent {
  type: 'CONFIRM_REVIEW';
}

export type CreateUpdateArtworkEvent =
  | GoBackEvent
  | ConfirmUploadEvent
  | ConfirmDimensionsEvent
  | ConfirmSelectionEvent
  | ConfirmFramingEvent
  | ConfirmDetailsEvent
  | ConfirmReviewEvent;

//////////////////////////
// Typestates
//////////////////////////

export interface UploadTypestate {
  value: 'upload';
  context: CreateUpdateArtworkContext;
}

export interface DimensionsTypestate {
  value: 'dimensions';
  context: SemiRequired<CreateUpdateArtworkContext, 'upload' | 'dimensions'>;
}

export interface SelectionTypestate {
  value: 'selection';
  context: SemiRequired<CreateUpdateArtworkContext, 'upload' | 'dimensions'>;
}

export interface FramingTypestate {
  value: 'framing';
  context: SemiRequired<CreateUpdateArtworkContext, 'upload' | 'dimensions' | 'selection'>;
}

export interface DetailsTypestate {
  value: 'details';
  context: SemiRequired<
    CreateUpdateArtworkContext,
    'upload' | 'dimensions' | 'selection' | 'framing'
  >;
}

export interface ReviewTypestate {
  value: 'review';
  context: Required<CreateUpdateArtworkContext>;
}

export interface CompleteTypestate {
  value: 'complete';
  context: Required<CreateUpdateArtworkContext>;
}

export type CreateUpdateArtworkTypestate =
  | UploadTypestate
  | DimensionsTypestate
  | SelectionTypestate
  | FramingTypestate
  | DetailsTypestate
  | ReviewTypestate
  | CompleteTypestate;

///////////////////////
// Utility Types
///////////////////////

export interface CreateUpdateArtworkTypestateMap {
  upload: UploadTypestate;
  dimensions: DimensionsTypestate;
  selection: SelectionTypestate;
  framing: FramingTypestate;
  details: DetailsTypestate;
  review: ReviewTypestate;
  complete: CompleteTypestate;
}

export type CreateUpdateArtworkState<Value extends CreateUpdateArtworkStateValue> = State<
  CreateUpdateArtworkTypestateMap[Value]['context'],
  CreateUpdateArtworkEvent,
  any,
  CreateUpdateArtworkTypestate
> & {
  value: Value;
};

export type CreateUpdateArtworkStateValue = CreateUpdateArtworkTypestate['value'];

///////////////////////
// Machine
///////////////////////

export const createUpdateArtworkMachine = createMachine<
  CreateUpdateArtworkContext,
  CreateUpdateArtworkEvent,
  CreateUpdateArtworkTypestate
>({
  id: 'form',
  initial: 'upload',
  context: {
    upload: undefined,
    dimensions: undefined,
    selection: undefined,
    framing: undefined,
    details: undefined,
  },
  states: {
    upload: {
      on: {
        CONFIRM_UPLOAD: {
          target: 'dimensions',
          actions: assign((ctx, evt) => ({
            upload: evt.upload,
            dimensions: evt.dimensions, // TODO: what if they went back?
          })),
        },
      },
    },
    dimensions: {
      on: {
        GO_BACK: {
          target: 'upload',
        },
        CONFIRM_DIMENSIONS: {
          target: 'selection',
          actions: assign((ctx, evt) => ({
            dimensions: evt.dimensions,
          })),
        },
      },
    },
    selection: {
      on: {
        GO_BACK: {
          target: 'dimensions',
        },
        CONFIRM_SELECTION: {
          target: 'framing',
          actions: assign((ctx, evt) => ({
            selection: evt.selection,
          })),
        },
      },
    },
    framing: {
      on: {
        GO_BACK: {
          target: 'selection',
        },
        CONFIRM_FRAMING: {
          target: 'details',
          actions: assign((ctx, evt) => ({
            framing: evt.framing,
          })),
        },
      },
    },
    details: {
      on: {
        GO_BACK: {
          target: 'framing',
        },
        CONFIRM_DETAILS: {
          target: 'review',
          actions: assign((ctx, evt) => ({
            details: evt.details,
          })),
        },
      },
    },
    review: {
      on: {
        // TODO: events to go back to each state (e.g., 'EDIT_UPLOAD')
        CONFIRM_REVIEW: {
          target: 'complete',
        },
      },
    },
    complete: {
      type: 'final',
    },
  },
});
