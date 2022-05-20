import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import cx from 'classnames';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import * as Grid from '@src/features/grid';
import { DetailsScreen } from './01-DetailsScreen';
import { CollectionScreen } from './02-CollectionScreen';
import styles from './createGalleryModal.module.scss';
import {
  ChangeWidthEvent,
  createGalleryMachine,
  CreateGalleryStateValue,
  CreateGalleryTypestate,
  MoveArtworkEvent,
  ScreenRefValue,
} from './state';

export interface CreateGalleryModalProps {
  onSave?(gallery: GalleryDto): void;
  onComplete?(gallery: GalleryDto): void;
  trigger: ReactNode;
}

export const CreateGalleryModalContext = createContext({ height: 0, color: 'paper' });

interface GridBlockProps {
  state: CreateGalleryTypestate;
  isEditing?: boolean;
  send: (event: ChangeWidthEvent | MoveArtworkEvent) => void;
}
const GridBlock = ({ state, send, isEditing }: GridBlockProps) => {
  const ctx = useContext(CreateGalleryModalContext);
  return (
    <Grid.Root
      size={{ width: state.context.width, height: ctx.height }}
      items={state.context.gallery?.artworks ?? []}
      step={1}
      getItemId={item => item.id}
      renderItem={(item, props) => (
        <GridArtwork {...props} item={item} isEditing={isEditing} disabled={props.disabled} />
      )}
      onSizeChange={size => {
        send({ type: 'CHANGE_WIDTH', width: size.width });
      }}
      onItemChange={(index, data) => {
        console.log(index, data);
        send({ type: 'MOVE_ARTWORK', index, data });
      }}>
      <FormModal.Sidecar className={cx(styles.gridBlock, `theme--${ctx.color}`)}>
        <div className={styles.gridBlockGridWrapper}>
          <Grid.Grid className={styles.gridBlockGrid} />
        </div>
        <div className={styles.gridBlockMap}>
          <Grid.Map />
        </div>
      </FormModal.Sidecar>
    </Grid.Root>
  );
};

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
          <GridBlock state={state} send={send} />
        </DetailsScreen>
      );
    } else if (state.matches('collection')) {
      return (
        <CollectionScreen
          state={state}
          onAddArtwork={data => {
            send({ type: 'ADD_ARTWORK', artwork: data });
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
          <GridBlock state={state} send={send} isEditing />
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
