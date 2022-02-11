import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import cx from 'classnames';
import { FormikProps } from 'formik';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import * as Grid from '@src/features/grid';
import { CollectionScreen } from './CollectionScreen';
import { DetailsScreen } from './DetailsScreen';
import styles from './createGalleryModal.module.scss';
import { createGalleryMachine, CreateGalleryStateValue } from './state';
import { GridArtwork } from '../../GridArtwork';

interface CreateGalleryModalProps {
  onComplete(gallery: GalleryDto): void;
  trigger: ReactNode;
}

export const CreateGalleryModalContext = createContext({ height: 0, color: 'paper' });

export const CreateGalleryModal = ({ onComplete, trigger }: CreateGalleryModalProps) => {
  const [state, send] = useMachine(() =>
    createGalleryMachine.withContext({
      gallery: undefined,
    }),
  );

  const [open, setOpen] = useState(false);

  const formikRef = useRef<FormikProps<any>>(null);

  const GridBlock = () => {
    const ctx = useContext(CreateGalleryModalContext);
    return (
      <Grid.Root
        size={{ width: 10, height: ctx.height }}
        items={[] as PlacedArtworkDto[]}
        step={1}
        getItemId={item => String(item.artwork.id)}
        renderItem={(item, props) => (
          <GridArtwork {...props} item={item} disabled={props.disabled} />
        )}>
        <div className={cx(styles.gridBlock, `theme--${ctx.color}`)}>
          <div className={styles.gridBlockGridWrapper}>
            <Grid.Grid className={styles.gridBlockGrid} />
          </div>
          <div className={styles.gridBlockMap}>
            <Grid.Map />
          </div>
        </div>
      </Grid.Root>
    );
  };

  const renderStep = () => {
    if (state.matches('details')) {
      return (
        <DetailsScreen ref={formikRef} state={state} onSubmit={data => send(data)}>
          <GridBlock />
        </DetailsScreen>
      );
    } else if (state.matches('collection')) {
      return (
        <CollectionScreen
          ref={formikRef}
          state={state}
          onBack={() => send({ type: 'GO_BACK' })}
          onSubmit={data => onComplete(data)}>
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
      open={open}
      onOpenChange={setOpen}
      // backgrounded={openGridModal}
      trigger={trigger}
      title="Create Gallery"
      description={`Step ${stepIdx + 1} of ${stepKeys.length}`}
      progress={(stepIdx + 1) / stepKeys.length}
      overlayClassName={styles.overlay}
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
      getIsDirty={() => formikRef.current?.dirty ?? false}>
      {renderStep()}
    </FormModal.Root>
  );
};
