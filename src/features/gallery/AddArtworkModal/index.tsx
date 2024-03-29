import { ReactNode, useEffect, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { SelectionScreen } from './01-SelectionScreen';
import { FramingScreen } from './02-FramingScreen';
import { addArtworkMachine, AddArtworkStateValue, ScreenRefValue } from './state';

export interface AddArtworkModalProps {
  gallery: GalleryDto;
  onSave(data: PlacedArtworkDto): void;
  trigger: ReactNode;
}

export const AddArtworkModal = ({ gallery, onSave, trigger }: AddArtworkModalProps) => {
  const [state, send] = useMachine(addArtworkMachine);

  const [open, setOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) {
      const screenHeading = modalRef.current?.querySelector('h3');
      if (screenHeading) {
        screenHeading.focus();
      }
    }
  }, [state.value]);

  const screenRef = useRef<ScreenRefValue>(null);

  const renderStep = () => {
    if (state.matches('selection')) {
      return (
        <SelectionScreen
          ref={screenRef}
          state={state}
          onSubmit={data => {
            send(data);
          }}
        />
      );
    } else if (state.matches('framing')) {
      return (
        <FramingScreen
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
      ref={modalRef}
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
        title: 'Abandon Artwork',
        description: 'Are you sure you want to abandon adding this new artwork?',
        hint: 'Your data will not be saved.',
        action: (
          <Button danger filled>
            Abandon
          </Button>
        ),
      }}
      getIsDirty={() => stepIdx > 0 || (screenRef.current?.getIsDirty() ?? false)}>
      {renderStep()}
    </FormModal.Root>
  );
};
