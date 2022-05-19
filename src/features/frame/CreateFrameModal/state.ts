import { MeasureUnit } from '@prisma/client';
import { assign, createMachine, State } from 'xstate';
import type { SelectionEditorSnapshot } from '@src/features/selection';

export interface ScreenRefValue {
  getIsDirty(): boolean;
}

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
  depth: number;
  unit: MeasureUnit;
}

export interface SelectionContext {
  snapshot: SelectionEditorSnapshot;
  preview: string;
}

export interface DetailsContext {
  name: string;
  altText: string;
}

export interface CreateFrameContext {
  upload?: UploadContext;
  dimensions?: DimensionsContext;
  selection?: SelectionContext;
  details?: DetailsContext;
}

//////////////////////////
// Events
//////////////////////////

export interface ResetEvent {
  type: 'RESET';
}

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

export type CreateFrameEvent =
  | ResetEvent
  | GoBackEvent
  | ConfirmUploadEvent
  | ConfirmDimensionsEvent
  | ConfirmSelectionEvent
  | ConfirmDetailsEvent
  | EditDimensionsEvent
  | EditSelectionEvent
  | EditDetailsEvent;

//////////////////////////
// Typestates
//////////////////////////

export interface UploadTypestate {
  value: 'upload';
  context: CreateFrameContext;
}

export interface DimensionsTypestate {
  value: 'dimensions';
  context: PickRequired<CreateFrameContext, 'upload' | 'dimensions'>;
}

export interface SelectionTypestate {
  value: 'selection';
  context: PickRequired<CreateFrameContext, 'upload' | 'dimensions'>;
}

export interface DetailsTypestate {
  value: 'details';
  context: PickRequired<CreateFrameContext, 'upload' | 'dimensions' | 'selection'>;
}

export interface ReviewTypestate {
  value: 'review';
  context: Required<CreateFrameContext>;
}

export type CreateFrameTypestate =
  | UploadTypestate
  | DimensionsTypestate
  | SelectionTypestate
  | DetailsTypestate
  | ReviewTypestate;

///////////////////////
// Utility Types
///////////////////////

export type CreateFrameStateValue = CreateFrameTypestate['value'];

export interface CreateFrameTypestateMap {
  upload: UploadTypestate;
  dimensions: DimensionsTypestate;
  selection: SelectionTypestate;
  details: DetailsTypestate;
  review: ReviewTypestate;
}

export type CreateFrameState<Value extends CreateFrameStateValue> = State<
  CreateFrameTypestateMap[Value]['context'],
  CreateFrameEvent,
  any,
  CreateFrameTypestate
> & {
  value: Value;
};

///////////////////////
// Machine
///////////////////////

export const createFrameMachine = createMachine<
  CreateFrameContext,
  CreateFrameEvent,
  CreateFrameTypestate
>({
  id: 'form',
  context: {
    upload: undefined,
    dimensions: undefined,
    selection: undefined,
    details: undefined,
  },
  initial: 'upload',
  states: {
    upload: {
      on: {
        RESET: {
          target: 'upload',
          actions: assign((ctx, evt) => ({
            upload: undefined,
            dimensions: undefined,
            selection: undefined,
            details: undefined,
          })),
        },
        CONFIRM_UPLOAD: {
          target: 'dimensions',
          actions: assign((ctx, evt) => {
            const didUploadChange = evt.upload.image.src !== ctx.upload?.image.src;
            return {
              upload: evt.upload,
              dimensions: evt.dimensions,
              selection: didUploadChange ? undefined : ctx.selection,
              details: didUploadChange ? undefined : ctx.details,
            };
          }),
        },
      },
    },
    dimensions: {
      on: {
        RESET: {
          target: 'upload',
          actions: assign((ctx, evt) => ({
            upload: undefined,
            dimensions: undefined,
            selection: undefined,
            details: undefined,
          })),
        },
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
        RESET: {
          target: 'upload',
          actions: assign((ctx, evt) => ({
            upload: undefined,
            dimensions: undefined,
            selection: undefined,
            details: undefined,
          })),
        },
        GO_BACK: {
          target: 'dimensions',
        },
        CONFIRM_SELECTION: {
          target: 'details',
          actions: assign((ctx, evt) => ({
            selection: evt.selection,
          })),
        },
      },
    },
    details: {
      on: {
        RESET: {
          target: 'upload',
          actions: assign((ctx, evt) => ({
            upload: undefined,
            dimensions: undefined,
            selection: undefined,
            details: undefined,
          })),
        },
        GO_BACK: {
          target: 'selection',
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
        RESET: {
          target: 'upload',
          actions: assign((ctx, evt) => ({
            upload: undefined,
            dimensions: undefined,
            selection: undefined,
            details: undefined,
          })),
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
  },
});
