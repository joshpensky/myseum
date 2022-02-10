import { ReactNode, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import { FormikProps } from 'formik';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { CollectionScreen } from './CollectionScreen';
import { DetailsScreen } from './DetailsScreen';
import styles from './createGalleryModal.module.scss';
import { createGalleryMachine, CreateGalleryStateValue } from './state';

interface CreateGalleryModalProps {
  onComplete(gallery: GalleryDto): void;
  trigger: ReactNode;
}

export const CreateGalleryModal = ({ onComplete, trigger }: CreateGalleryModalProps) => {
  const [state, send] = useMachine(() =>
    createGalleryMachine.withContext({
      gallery: undefined,
    }),
  );

  const [open, setOpen] = useState(false);

  const formikRef = useRef<FormikProps<any>>(null);

  const stepKeys: CreateGalleryStateValue[] = ['details', 'collection'];
  const stepIdx = stepKeys.findIndex(value => state.matches(value));

  const renderStep = () => {
    if (state.matches('details')) {
      return <DetailsScreen ref={formikRef} state={state} onSubmit={data => send(data)} />;
    } else if (state.matches('collection')) {
      return (
        <CollectionScreen
          ref={formikRef}
          state={state}
          onBack={() => send({ type: 'GO_BACK' })}
          onSubmit={data => onComplete(data)}
        />
      );
    } else {
      throw new Error('Form has entered unknown state.');
    }
  };

  return (
    <FormModal.Root
      open={open}
      onOpenChange={setOpen}
      // backgrounded={openGridModal}
      trigger={trigger}
      title="Create Gallery"
      description={`Step ${stepIdx + 1} of ${stepKeys.length}`}
      progress={stepIdx + 1 / stepKeys.length}
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
