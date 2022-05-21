import { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { GalleryColor } from '@prisma/client';
import { useMachine } from '@xstate/react';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { GridSidecar } from '@src/features/gallery/CreateGalleryModal/GridSidecar';
import { ReviewScreen } from './01-ReviewScreen';
import { DetailsScreen } from './02a-DetailsScreen';
import { CollectionScreen } from './02b-CollectionScreen';
import { EditGalleryContext, editGalleryMachine, ScreenRefValue } from './state';

export interface EditGalleryModalProps {
  gallery: GalleryDto;
  onSave(gallery: GalleryDto): void;
  trigger: ReactNode;
}

export const EditGalleryModalContext = createContext<{ height: number; color: GalleryColor }>({
  height: 0,
  color: 'paper',
});

export const EditGalleryModal = ({ gallery, onSave, trigger }: EditGalleryModalProps) => {
  const router = useRouter();

  const galleryWidth =
    10 + Math.max(0, ...gallery.artworks.map(item => item.position.x + item.size.width));
  const initialContext: EditGalleryContext = {
    width: galleryWidth,
    gallery,
  };

  const [state, send] = useMachine(() => editGalleryMachine.withContext(initialContext));

  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    send({ type: 'RESET', context: initialContext });
  };

  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) {
      const screenHeading = modalRef.current?.querySelector('h3');
      if (screenHeading) {
        screenHeading.focus();
      }
    }
  }, [state.value]);

  const handleBack = () => {
    if (state.can('GO_BACK')) {
      send({ type: 'GO_BACK' });
    }
  };

  const screenRef = useRef<ScreenRefValue>(null);

  const renderScreen = () => {
    if (state.matches('review')) {
      return (
        <ReviewScreen
          state={state}
          onDelete={() => {
            onOpenChange(false);
            router.push('/');
          }}
          onEdit={evt => send(evt)}
          onSubmit={data => {
            onSave(data);
            onOpenChange(false);
          }}>
          <GridSidecar
            color={state.context.gallery.color}
            height={state.context.gallery.height}
            state={state}
            send={send}
          />
        </ReviewScreen>
      );
    } else if (state.matches('details')) {
      return (
        <DetailsScreen state={state} onBack={handleBack} onSubmit={evt => send(evt)}>
          <EditGalleryModalContext.Consumer>
            {ctx => <GridSidecar color={ctx.color} height={ctx.height} state={state} send={send} />}
          </EditGalleryModalContext.Consumer>
        </DetailsScreen>
      );
    } else if (state.matches('collection')) {
      return (
        <CollectionScreen
          state={state}
          onBack={handleBack}
          onSubmit={evt => send(evt)}
          onAddArtwork={data => send({ type: 'ADD_ARTWORK', artwork: data })}
          onDeleteArtwork={data => send({ type: 'DELETE_ARTWORK', artwork: data })}>
          <GridSidecar
            color={state.context.gallery.color}
            height={state.context.gallery.height}
            state={state}
            send={send}
            isEditing
          />
        </CollectionScreen>
      );
    } else {
      throw new Error('Form has entered unknown state.');
    }
  };

  return (
    <FormModal.Root
      ref={modalRef}
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="Edit Gallery"
      abandonDialogProps={{
        title: 'Discard Changes',
        description: 'Are you sure you want to abandon editing?',
        hint: 'Your changes will not be saved.',
        action: (
          <Button danger filled>
            Discard
          </Button>
        ),
      }}
      getIsDirty={() => screenRef.current?.getIsDirty() ?? false}>
      {renderScreen()}
    </FormModal.Root>
  );
};
