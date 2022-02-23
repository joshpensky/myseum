import { assign, createMachine, State } from 'xstate';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';

//////////////////////////
// Context
//////////////////////////

export interface AddArtworkContext {
  artwork?: ArtworkDto;
}

//////////////////////////
// Events
//////////////////////////

export interface GoBackEvent {
  type: 'GO_BACK';
}

export interface ResetEvent {
  type: 'RESET';
}

export interface ConfirmSelectionEvent {
  type: 'CONFIRM_SELECTION';
  artwork: ArtworkDto;
}

export type AddArtworkEvent = GoBackEvent | ResetEvent | ConfirmSelectionEvent;

//////////////////////////
// Typestates
//////////////////////////

export interface SelectionTypestate {
  value: 'selection';
  context: AddArtworkContext;
}

export interface FramingTypestate {
  value: 'framing';
  context: Required<AddArtworkContext>;
}

export type AddArtworkTypestate = SelectionTypestate | FramingTypestate;

///////////////////////
// Utility Types
///////////////////////

export type AddArtworkStateValue = AddArtworkTypestate['value'];

export interface AddArtworkTypestateMap {
  selection: SelectionTypestate;
  framing: FramingTypestate;
}

export type AddArtworkState<Value extends AddArtworkStateValue> = State<
  AddArtworkTypestateMap[Value]['context'],
  AddArtworkEvent,
  any,
  AddArtworkTypestate
> & {
  value: Value;
};

///////////////////////
// Machine
///////////////////////

export const addArtworkMachine = createMachine<
  AddArtworkContext,
  AddArtworkEvent,
  AddArtworkTypestate
>({
  id: 'form',
  context: {
    artwork: undefined,
  },
  initial: 'selection',
  states: {
    selection: {
      on: {
        CONFIRM_SELECTION: {
          target: 'framing',
          actions: assign((ctx, evt) => ({
            artwork: evt.artwork,
          })),
        },
        RESET: {
          target: 'selection',
          actions: assign((ctx, evt) => ({
            artwork: undefined,
          })),
        },
      },
    },
    framing: {
      on: {
        GO_BACK: {
          target: 'selection',
        },
        RESET: {
          target: 'selection',
          actions: assign((ctx, evt) => ({
            artwork: undefined,
          })),
        },
      },
    },
  },
});
