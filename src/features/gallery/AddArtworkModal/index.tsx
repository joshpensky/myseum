import { ReactNode, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import { FormikProps } from 'formik';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { FramingScreen } from './FramingScreen';
import { SelectionScreen } from './SelectionScreen';
import { addArtworkMachine, AddArtworkStateValue } from './state';

interface AddArtworkModalProps {
  gallery: GalleryDto;
  onSave(data: PlacedArtworkDto): void;
  trigger: ReactNode;
}

export const AddArtworkModal = ({ gallery, onSave, trigger }: AddArtworkModalProps) => {
  const [state, send] = useMachine(addArtworkMachine);

  const [open, setOpen] = useState(false);

  const formikRef = useRef<FormikProps<any>>(null);

  const renderStep = () => {
    if (state.matches('selection')) {
      return (
        <SelectionScreen
          ref={formikRef}
          state={state}
          onSubmit={data => {
            send(data);
          }}
        />
      );
    } else if (state.matches('framing')) {
      return (
        <FramingScreen
          ref={formikRef}
          gallery={gallery}
          state={state}
          onBack={() => send({ type: 'GO_BACK' })}
          onSubmit={data => {
            onSave(data);
            setOpen(false);
          }}
        />
      );
    } else {
      throw new Error('Form has entered unknown state.');
    }
  };

  const stepKeys: AddArtworkStateValue[] = ['selection', 'framing'];
  const stepIdx = stepKeys.findIndex(value => state.matches(value));

  return (
    <FormModal.Root
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen);
        send({ type: 'RESET' });
      }}
      trigger={trigger}
      title="Add Artwork"
      description={`Step ${stepIdx + 1} of ${stepKeys.length}`}
      progress={(stepIdx + 1) / stepKeys.length}
      abandonDialogProps={{
        title: 'Discard Artwork',
        description: 'Are you sure you want to discard adding this new artwork?',
        hint: 'Your data will not be saved.',
        action: (
          <Button danger filled>
            Discard
          </Button>
        ),
      }}
      getIsDirty={() => formikRef.current?.dirty ?? stepIdx > 0}>
      {renderStep()}
    </FormModal.Root>
  );
};
