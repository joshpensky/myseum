import { assign, createMachine, State } from 'xstate';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';

export interface ScreenRefValue {
  getIsDirty(): boolean;
}

//////////////////////////
// Context
//////////////////////////

export interface CreateGalleryContext {
  gallery?: GalleryDto;
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

export interface ConfirmDetailsEvent {
  type: 'CONFIRM_DETAILS';
  gallery: GalleryDto;
}

export interface AddArtworkEvent {
  type: 'ADD_ARTWORK';
  artwork: PlacedArtworkDto;
}

export type CreateGalleryEvent = GoBackEvent | ResetEvent | ConfirmDetailsEvent | AddArtworkEvent;

//////////////////////////
// Typestates
//////////////////////////

export interface DetailsTypestate {
  value: 'details';
  context: CreateGalleryContext;
}

export interface CollectionTypestate {
  value: 'collection';
  context: Required<CreateGalleryContext>;
}

export type CreateGalleryTypestate = DetailsTypestate | CollectionTypestate;

///////////////////////
// Utility Types
///////////////////////

export type CreateGalleryStateValue = CreateGalleryTypestate['value'];

export interface CreateGalleryTypestateMap {
  details: DetailsTypestate;
  collection: CollectionTypestate;
}

export type CreateGalleryState<Value extends CreateGalleryStateValue> = State<
  CreateGalleryTypestateMap[Value]['context'],
  CreateGalleryEvent,
  any,
  CreateGalleryTypestate
> & {
  value: Value;
};

///////////////////////
// Machine
///////////////////////

export const createGalleryMachine = createMachine<
  CreateGalleryContext,
  CreateGalleryEvent,
  CreateGalleryTypestate
>({
  id: 'form',
  context: {
    gallery: undefined,
  },
  initial: 'details',
  states: {
    details: {
      on: {
        CONFIRM_DETAILS: {
          target: 'collection',
          actions: assign((ctx, evt) => ({
            gallery: evt.gallery,
          })),
        },
        RESET: {
          target: 'details',
          actions: assign((ctx, evt) => ({
            gallery: undefined,
          })),
        },
      },
    },
    collection: {
      on: {
        GO_BACK: {
          target: 'details',
        },
        RESET: {
          target: 'details',
          actions: assign((ctx, evt) => ({
            gallery: undefined,
          })),
        },
        ADD_ARTWORK: {
          actions: assign((ctx, evt) => {
            let gallery: GalleryDto | undefined = undefined;
            if (ctx.gallery) {
              gallery = {
                ...ctx.gallery,
                artworks: [...ctx.gallery.artworks, evt.artwork],
              };
            }
            return { gallery };
          }),
        },
      },
    },
  },
});
