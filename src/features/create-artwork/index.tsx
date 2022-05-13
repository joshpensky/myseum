import { ReactNode, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { DetailsStep } from './DetailsStep';
import { DimensionsStep } from './DimensionsStep';
import { SelectionStep } from './SelectionStep';
import { UploadStep } from './UploadStep';
import styles from './createArtwork.module.scss';
import { createArtworkMachine, CreateArtworkStateValue, StepRefValue } from './state';

interface CreateArtworkModalProps {
  trigger: ReactNode;
  onComplete(): void;
}

export const CreateArtworkModal = ({ trigger }: CreateArtworkModalProps) => {
  const stepRef = useRef<StepRefValue>(null);

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

  const handleBack = () => {
    if (state.can('GO_BACK')) {
      send({ type: 'GO_BACK' });
    }
  };

  const renderStep = () => {
    if (state.matches('upload')) {
      return <UploadStep ref={stepRef} state={state} onSubmit={data => send(data)} />;
    } else if (state.matches('dimensions')) {
      return <DimensionsStep state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else if (state.matches('selection')) {
      return <SelectionStep state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else if (state.matches('details')) {
      return <DetailsStep state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else {
      return null;
      // throw new Error('Form has entered unknown state.');
    }
    //    else if (state.matches('review')) {
    //   return (
    //     <ReviewStep
    //       state={state}
    //       user={user}
    //       onEdit={event => send(event)}
    //       onSubmit={data => onComplete(data)}
    //     />
    //   );
    // }
  };

  // Get the current step index (sans 'complete')
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
      getIsDirty={() => stepRef.current?.getIsDirty() ?? stepIdx > 0}
      trigger={trigger}>
      {renderStep()}
    </FormModal.Root>
  );
};
