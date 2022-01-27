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
  artist?: {
    id?: number;
    name: string;
  };
  description: string;
  altText: string;
  createdAt?: Date;
  acquiredAt: Date;
}

export interface CreateArtworkContext {
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

export interface EditDimensionsEvent {
  type: 'EDIT_DIMENSIONS';
}

export interface EditSelectionEvent {
  type: 'EDIT_SELECTION';
}

export interface EditFramingEvent {
  type: 'EDIT_FRAMING';
}

export interface EditDetailsEvent {
  type: 'EDIT_DETAILS';
}

export type CreateArtworkEvent =
  | GoBackEvent
  | ConfirmUploadEvent
  | ConfirmDimensionsEvent
  | ConfirmSelectionEvent
  | ConfirmFramingEvent
  | ConfirmDetailsEvent
  | EditDimensionsEvent
  | EditSelectionEvent
  | EditFramingEvent
  | EditDetailsEvent;

//////////////////////////
// Typestates
//////////////////////////

export interface UploadTypestate {
  value: 'upload';
  context: CreateArtworkContext;
}

export interface DimensionsTypestate {
  value: 'dimensions';
  context: PickRequired<CreateArtworkContext, 'upload' | 'dimensions'>;
}

export interface SelectionTypestate {
  value: 'selection';
  context: PickRequired<CreateArtworkContext, 'upload' | 'dimensions'>;
}

export interface FramingTypestate {
  value: 'framing';
  context: PickRequired<CreateArtworkContext, 'upload' | 'dimensions' | 'selection'>;
}

export interface DetailsTypestate {
  value: 'details';
  context: PickRequired<CreateArtworkContext, 'upload' | 'dimensions' | 'selection' | 'framing'>;
}

export interface ReviewTypestate {
  value: 'review';
  context: Required<CreateArtworkContext>;
}

export type CreateArtworkTypestate =
  | UploadTypestate
  | DimensionsTypestate
  | SelectionTypestate
  | FramingTypestate
  | DetailsTypestate
  | ReviewTypestate;

///////////////////////
// Utility Types
///////////////////////

export type CreateArtworkStateValue = CreateArtworkTypestate['value'];

export interface CreateArtworkTypestateMap {
  upload: UploadTypestate;
  dimensions: DimensionsTypestate;
  selection: SelectionTypestate;
  framing: FramingTypestate;
  details: DetailsTypestate;
  review: ReviewTypestate;
}

export type CreateArtworkState<Value extends CreateArtworkStateValue> = State<
  CreateArtworkTypestateMap[Value]['context'],
  CreateArtworkEvent,
  any,
  CreateArtworkTypestate
> & {
  value: Value;
};

///////////////////////
// Machine
///////////////////////

export const createArtworkMachine = createMachine<
  CreateArtworkContext,
  CreateArtworkEvent,
  CreateArtworkTypestate
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
      // type: 'final',
      meta: {
        title: 'Review',
        description: 'Make any last edits and confirm your selections.',
      },
      on: {
        EDIT_DIMENSIONS: {
          target: 'dimensions',
        },
        EDIT_SELECTION: {
          target: 'selection',
        },
        EDIT_FRAMING: {
          target: 'framing',
        },
        EDIT_DETAILS: {
          target: 'details',
        },
      },
    },
  },
});
