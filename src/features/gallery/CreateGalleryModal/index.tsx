import { createContext, ReactNode, useRef, useState } from 'react';
import { GalleryColor } from '@prisma/client';
import { useMachine } from '@xstate/react';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { DetailsScreen } from './01-DetailsScreen';
import { CollectionScreen } from './02-CollectionScreen';
import { GridSidecar } from './GridSidecar';
import styles from './createGalleryModal.module.scss';
import { createGalleryMachine, CreateGalleryStateValue, ScreenRefValue } from './state';

export interface CreateGalleryModalProps {
  onSave?(gallery: GalleryDto): void;
  onComplete?(gallery: GalleryDto): void;
  trigger: ReactNode;
}

export const CreateGalleryModalContext = createContext<{ height: number; color: GalleryColor }>({
  height: 0,
  color: 'paper',
});

export const CreateGalleryModal = ({ onComplete, onSave, trigger }: CreateGalleryModalProps) => {
  const screenRef = useRef<ScreenRefValue>(null);
  const [open, setOpen] = useState(false);
  const [state, send] = useMachine(createGalleryMachine);

  const renderStep = () => {
    if (state.matches('details')) {
      return (
        <DetailsScreen
          ref={screenRef}
          state={state}
          onSubmit={data => {
            onSave?.(data.gallery);
            send(data);
          }}>
          <CreateGalleryModalContext.Consumer>
            {ctx => <GridSidecar color={ctx.color} height={ctx.height} state={state} send={send} />}
          </CreateGalleryModalContext.Consumer>
        </DetailsScreen>
      );
    } else if (state.matches('collection')) {
      return (
        <CollectionScreen
          state={state}
          onAddArtwork={data => {
            send({ type: 'ADD_ARTWORK', artwork: data });
          }}
          onDeleteArtwork={data => {
            send({ type: 'DELETE_ARTWORK', artwork: data });
          }}
          onBack={data => {
            onSave?.(data);
            send({ type: 'GO_BACK' });
          }}
          onSubmit={data => {
            onSave?.(data);
            onComplete?.(data);
            setOpen(false);
          }}>
          <CreateGalleryModalContext.Consumer>
            {ctx => (
              <GridSidecar
                color={ctx.color}
                height={ctx.height}
                state={state}
                send={send}
                isEditing
              />
            )}
          </CreateGalleryModalContext.Consumer>
        </CollectionScreen>
      );
    } else {
      throw new Error('Form has entered unknown state.');
    }
  };

  const stepKeys: CreateGalleryStateValue[] = ['details', 'collection'];
  const stepIdx = stepKeys.findIndex(value => state.matches(value));

  return (
    <FormModal.Root
      overlayClassName={styles.overlay}
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen && state.context.gallery) {
          onComplete?.(state.context.gallery);
        }
        setOpen(nextOpen);
        send({ type: 'RESET' });
      }}
      trigger={trigger}
      title="Create Gallery"
      description={`Step ${stepIdx + 1} of ${stepKeys.length}`}
      progress={(stepIdx + 1) / stepKeys.length}
      abandonDialogProps={{
        title: 'Discard Gallery',
        description: 'Are you sure you want to discard your new gallery?',
        hint: 'Your data will not be saved.',
        action: (
          <Button danger filled>
            Discard
          </Button>
        ),
      }}
      getIsDirty={() => stepIdx > 0 || (screenRef.current?.getIsDirty() ?? false)}>
      {renderStep()}
    </FormModal.Root>
  );
};
