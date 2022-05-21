import { ReactNode, useEffect, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { UploadScreen } from './01-UploadScreen';
import { DimensionsScreen } from './02-DimensionsScreen';
import { SelectionScreen } from './03-SelectionScreen';
import { DetailsScreen } from './04-DetailsScreen';
import { ReviewScreen } from './05-ReviewScreen';
import styles from './createArtwork.module.scss';
import { createArtworkMachine, CreateArtworkStateValue, ScreenRefValue } from './state';

export interface CreateArtworkModalProps {
  trigger: ReactNode;
  onComplete(data: ArtworkDto): void;
}

export const CreateArtworkModal = ({ onComplete, trigger }: CreateArtworkModalProps) => {
  const screenRef = useRef<ScreenRefValue>(null);

  const [state, send] = useMachine(() =>
    createArtworkMachine.withContext({
      upload: undefined,
      dimensions: undefined,
      selection: undefined,
      details: undefined,
    }),
  );

  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      send({ type: 'RESET' });
    }
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

  const renderStep = () => {
    if (state.matches('upload')) {
      return <UploadScreen ref={screenRef} state={state} onSubmit={data => send(data)} />;
    } else if (state.matches('dimensions')) {
      return <DimensionsScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else if (state.matches('selection')) {
      return <SelectionScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else if (state.matches('details')) {
      return <DetailsScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else if (state.matches('review')) {
      return (
        <ReviewScreen
          state={state}
          onEdit={event => send(event)}
          onSubmit={data => {
            onComplete(data);
            onOpenChange(false);
          }}
        />
      );
    } else {
      throw new Error('Form has entered unknown state.');
    }
  };

  // Get the current step index
  const stepKeys: CreateArtworkStateValue[] = [
    'upload',
    'dimensions',
    'selection',
    'details',
    'review',
  ];
  const stepIdx = stepKeys.findIndex(value => state.matches(value));

  return (
    <FormModal.Root
      ref={modalRef}
      overlayClassName={styles.overlay}
      open={open}
      onOpenChange={onOpenChange}
      title="Create Artwork"
      description={`Step ${stepIdx + 1} of ${stepKeys.length}`}
      progress={(stepIdx + 1) / stepKeys.length}
      abandonDialogProps={{
        title: 'Abandon Artwork',
        description: 'Are you sure you want to abandon creating this artwork?',
        hint: 'Your work can not be recovered.',
        action: (
          <Button danger filled>
            Abandon
          </Button>
        ),
      }}
      getIsDirty={() => stepIdx > 0 || (screenRef.current?.getIsDirty() ?? false)}
      trigger={trigger}>
      {renderStep()}
    </FormModal.Root>
  );
};
