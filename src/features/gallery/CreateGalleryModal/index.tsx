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
import { createGalleryMachine, CreateGalleryStateValue, ScreenRefValue } from './state';

interface CreateGalleryModalProps {
  onSave?(gallery: GalleryDto): void;
  onComplete?(gallery: GalleryDto): void;
  trigger: ReactNode;
}

export const CreateGalleryModalContext = createContext({ height: 0, color: 'paper' });

export const CreateGalleryModal = ({ onComplete, onSave, trigger }: CreateGalleryModalProps) => {
  const screenRef = useRef<ScreenRefValue>(null);
  const [open, setOpen] = useState(false);
  const [state, send] = useMachine(createGalleryMachine);

  const GridBlock = () => {
    const ctx = useContext(CreateGalleryModalContext);
    return (
      <Grid.Root
        size={{ width: 10, height: ctx.height }}
        items={state.context.gallery?.artworks ?? []}
        step={1}
        getItemId={item => String(item.artwork.id)}
        // TODO: add editing ability
        renderItem={(item, props) => (
          <GridArtwork {...props} item={item} disabled={props.disabled} />
        )}>
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
          <GridBlock />
        </DetailsScreen>
      );
    } else if (state.matches('collection')) {
      return (
        <CollectionScreen
          state={state}
          onAddArtwork={data => {
            send({ type: 'ADD_ARTWORK', artwork: data });
          }}
          onBack={() => {
            send({ type: 'GO_BACK' });
          }}
          onSubmit={data => {
            onSave?.(data);
            onComplete?.(data);
            setOpen(false);
          }}>
          <GridBlock />
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
