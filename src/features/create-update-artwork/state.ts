import { MeasureUnit } from '@prisma/client';
import { assign, createMachine, State } from 'xstate';
import type { FrameDto } from '@src/data/FrameSerializer';
import type { SelectionEditorPath } from '@src/features/selection';

type PickRequired<Type, Keys extends keyof Type> = Type & Required<Pick<Type, Keys>>;

//////////////////////////
// Context
//////////////////////////

export interface UploadContext {
  image: HTMLImageElement;
}

export interface DimensionsContext {
  width: number;
  height: number;
  unit: MeasureUnit;
}

export interface SelectionContext {
  path: SelectionEditorPath;
  preview: HTMLImageElement;
}

export type FramingContext =
  | {
      hasFrame: true;
      frame: FrameDto;
      depth?: never;
    }
  | {
      hasFrame: false;
      depth: number;
      frame?: never;
    };

export interface DetailsContext {
  title: string;
  artist?: string;
  description: string;
  altText: string;
  createdAt?: Date;
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

export type CreateUpdateArtworkEvent =
  | GoBackEvent
  | ConfirmUploadEvent
  | ConfirmDimensionsEvent
  | ConfirmSelectionEvent
  | ConfirmFramingEvent
  | ConfirmDetailsEvent;

//////////////////////////
// Typestates
//////////////////////////

export interface UploadTypestate {
  value: 'upload';
  context: CreateUpdateArtworkContext;
}

export interface DimensionsTypestate {
  value: 'dimensions';
  context: PickRequired<CreateUpdateArtworkContext, 'upload' | 'dimensions'>;
}

export interface SelectionTypestate {
  value: 'selection';
  context: PickRequired<CreateUpdateArtworkContext, 'upload' | 'dimensions'>;
}

export interface FramingTypestate {
  value: 'framing';
  context: PickRequired<CreateUpdateArtworkContext, 'upload' | 'dimensions' | 'selection'>;
}

export interface DetailsTypestate {
  value: 'details';
  context: PickRequired<
    CreateUpdateArtworkContext,
    'upload' | 'dimensions' | 'selection' | 'framing'
  >;
}

export interface ReviewTypestate {
  value: 'review';
  context: Required<CreateUpdateArtworkContext>;
}

export type CreateUpdateArtworkTypestate =
  | UploadTypestate
  | DimensionsTypestate
  | SelectionTypestate
  | FramingTypestate
  | DetailsTypestate
  | ReviewTypestate;

///////////////////////
// Utility Types
///////////////////////

export type CreateUpdateArtworkStateValue = CreateUpdateArtworkTypestate['value'];

export interface CreateUpdateArtworkTypestateMap {
  upload: UploadTypestate;
  dimensions: DimensionsTypestate;
  selection: SelectionTypestate;
  framing: FramingTypestate;
  details: DetailsTypestate;
  review: ReviewTypestate;
}

export type CreateUpdateArtworkState<Value extends CreateUpdateArtworkStateValue> = State<
  CreateUpdateArtworkTypestateMap[Value]['context'],
  CreateUpdateArtworkEvent,
  any,
  CreateUpdateArtworkTypestate
> & {
  value: Value;
};

///////////////////////
// Machine
///////////////////////

export const createUpdateArtworkMachine = createMachine<
  CreateUpdateArtworkContext,
  CreateUpdateArtworkEvent,
  CreateUpdateArtworkTypestate
>({
  id: 'form',
  context: {
    upload: undefined,
    dimensions: undefined,
    selection: undefined,
    framing: undefined,
    details: undefined,
  },
  initial: 'upload',
  states: {
    upload: {
      meta: {
        title: 'Upload',
        description: 'Add a photo of the artwork to get started.',
      },
      on: {
        CONFIRM_UPLOAD: {
          target: 'dimensions',
          actions: assign((ctx, evt) => ({
            upload: evt.upload,
            dimensions: evt.dimensions,
          })),
        },
      },
    },
    dimensions: {
      meta: {
        title: 'Dimensions',
        description: 'Adjust to match the size of your artwork.',
      },
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
      meta: {
        title: 'Selection',
        description: 'Drag the handles to outline the artwork.',
      },
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
      meta: {
        title: 'Framing',
        description: 'Choose a framing option for the artwork.',
      },
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
      meta: {
        title: 'Details',
        description: 'Fill in some information about the artwork.',
      },
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
      type: 'final',
      meta: {
        title: 'Review',
        description: 'Make any last edits and confirm your selections.',
      },
      on: {
        // TODO: events to go back to each state (e.g., 'EDIT_UPLOAD')
      },
    },
  },
});
