import { assign, createMachine, State } from 'xstate';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';

export interface ScreenRefValue {
  getIsDirty(): boolean;
}

//////////////////////////
// Context
//////////////////////////

export interface EditGalleryContext {
  width: number;
  gallery: GalleryDto;
}

//////////////////////////
// Events
//////////////////////////

export interface GoBackEvent {
  type: 'GO_BACK';
}

export interface ResetEvent {
  type: 'RESET';
  context: EditGalleryContext;
}

export interface EditDetailsEvent {
  type: 'EDIT_DETAILS';
}

export interface EditCollectionEvent {
  type: 'EDIT_COLLECTION';
}

export interface ConfirmDetailsEvent {
  type: 'CONFIRM_DETAILS';
  gallery: GalleryDto;
}

export interface AddArtworkEvent {
  type: 'ADD_ARTWORK';
  artwork: PlacedArtworkDto;
}

export interface MoveArtworkEvent {
  type: 'MOVE_ARTWORK';
  index: number;
  data: PlacedArtworkDto;
}

export interface DeleteArtworkEvent {
  type: 'DELETE_ARTWORK';
  artwork: PlacedArtworkDto;
}

export interface ChangeWidthEvent {
  type: 'CHANGE_WIDTH';
  width: number;
}

export type EditGalleryEvent =
  | GoBackEvent
  | ResetEvent
  | EditDetailsEvent
  | EditCollectionEvent
  | ConfirmDetailsEvent
  | AddArtworkEvent
  | MoveArtworkEvent
  | DeleteArtworkEvent
  | ChangeWidthEvent;

//////////////////////////
// Typestates
//////////////////////////

export interface ReviewTypestate {
  value: 'review';
  context: EditGalleryContext;
}

export interface DetailsTypestate {
  value: 'details';
  context: EditGalleryContext;
}

export interface CollectionTypestate {
  value: 'collection';
  context: EditGalleryContext;
}

export type EditGalleryTypestate = ReviewTypestate | DetailsTypestate | CollectionTypestate;

///////////////////////
// Utility Types
///////////////////////

export type EditGalleryStateValue = EditGalleryTypestate['value'];

export interface EditGalleryTypestateMap {
  review: ReviewTypestate;
  details: DetailsTypestate;
  collection: CollectionTypestate;
}

export type EditGalleryState<Value extends EditGalleryStateValue> = State<
  EditGalleryTypestateMap[Value]['context'],
  EditGalleryEvent,
  any,
  EditGalleryTypestate
> & {
  value: Value;
};

///////////////////////
// Machine
///////////////////////

export const editGalleryMachine = createMachine<
  EditGalleryContext,
  EditGalleryEvent,
  EditGalleryTypestate
>({
  id: 'form',
  context: ({
    width: 10,
    gallery: undefined,
  } as unknown) as EditGalleryContext,
  initial: 'review',
  states: {
    review: {
      on: {
        EDIT_DETAILS: {
          target: 'details',
        },
        EDIT_COLLECTION: {
          target: 'collection',
        },
        RESET: {
          target: 'review',
          actions: assign((ctx, evt) => evt.context),
        },
      },
    },

    details: {
      on: {
        GO_BACK: {
          target: 'review',
        },
        CONFIRM_DETAILS: {
          target: 'review',
          actions: assign((ctx, evt) => ({
            gallery: evt.gallery,
          })),
        },
        RESET: {
          target: 'review',
          actions: assign((ctx, evt) => evt.context),
        },
      },
    },
    collection: {
      on: {
        GO_BACK: {
          target: 'review',
        },
        RESET: {
          target: 'review',
          actions: assign((ctx, evt) => evt.context),
        },
        ADD_ARTWORK: {
          actions: assign((ctx, evt) => {
            let width = 10;
            let gallery: GalleryDto | undefined = undefined;

            if (ctx.gallery) {
              gallery = {
                ...ctx.gallery,
                artworks: [...ctx.gallery.artworks, evt.artwork],
              };

              width += Math.max(
                0,
                ...gallery.artworks.map(item => item.position.x + item.size.width),
              );
            }

            return {
              width,
              gallery,
            };
          }),
        },
        MOVE_ARTWORK: {
          actions: assign((ctx, evt) => {
            let gallery: GalleryDto | undefined = undefined;

            if (ctx.gallery) {
              gallery = {
                ...ctx.gallery,
                artworks: [
                  ...ctx.gallery.artworks.slice(0, evt.index),
                  evt.data,
                  ...ctx.gallery.artworks.slice(evt.index + 1),
                ],
              };
            }

            return {
              gallery,
            };
          }),
        },
        DELETE_ARTWORK: {
          actions: assign((ctx, evt) => {
            let gallery: GalleryDto | undefined = undefined;

            if (ctx.gallery) {
              gallery = {
                ...ctx.gallery,
                artworks: ctx.gallery.artworks.filter(item => item.id !== evt.artwork.id),
              };
            }

            return {
              gallery,
            };
          }),
        },
        CHANGE_WIDTH: {
          actions: assign((ctx, evt) => ({
            width: evt.width,
          })),
        },
      },
    },
  },
});
