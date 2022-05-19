import { ReactNode, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { SelectionEditorState } from '@src/features/selection';
import { useAuth } from '@src/providers/AuthProvider';
// import { UploadScreen } from './01-UploadScreen';
// import { DimensionsScreen } from './02-DimensionsScreen';
// import { SelectionScreen } from './03-SelectionScreen';
// import { DetailsScreen } from './04-DetailsScreen';
// import { ReviewScreen } from './05-ReviewScreen';
import styles from './editArtworkModal.module.scss';
import { editArtworkMachine, EditArtworkStateValue, ScreenRefValue } from './state';

export interface CreateArtworkModalProps {
  artwork: ArtworkDto;
  trigger: ReactNode;
  onComplete(data: ArtworkDto): void;
}

export const EditArtworkModal = ({ artwork, onComplete, trigger }: CreateArtworkModalProps) => {
  const screenRef = useRef<ScreenRefValue>(null);
  const auth = useAuth();

  const [state, send] = useMachine(() => {
    const preview = new Image();
    preview.src = artwork.src;

    return editArtworkMachine.withContext({
      dimensions: {
        width: artwork.size.width,
        height: artwork.size.height,
        depth: artwork.size.depth,
        unit: artwork.unit,
      },
      selection: {
        path: SelectionEditorState.DEFAULT_INITIAL_SNAPSHOT.outline,
        preview,
      },
      details: {
        title: artwork.title,
        // artist,
        description: artwork.description,
        altText: artwork.alt,
        createdAt: artwork.createdAt ?? undefined,
        acquiredAt: artwork.acquiredAt,
      },
    });
  });

  const handleBack = () => {
    if (state.can('GO_BACK')) {
      send({ type: 'GO_BACK' });
    }
  };

  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      handleBack();
      // TODO: reset with initial context
    }
  };

  if (!auth.user) {
    return null;
  }
  const user = auth.user;

  const renderStep = () => null;
  // if (state.matches('upload')) {
  //   return <UploadScreen ref={screenRef} state={state} onSubmit={data => send(data)} />;
  // } else if (state.matches('dimensions')) {
  //   return <DimensionsScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
  // } else if (state.matches('selection')) {
  //   return <SelectionScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
  // } else if (state.matches('details')) {
  //   return <DetailsScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
  // } else if (state.matches('review')) {
  //   return (
  //     <ReviewScreen
  //       state={state}
  //       user={user}
  //       onEdit={event => send(event)}
  //       onSubmit={data => {
  //         onComplete(data);
  //         onOpenChange(false);
  //       }}
  //     />
  //   );
  // } else {
  //   throw new Error('Form has entered unknown state.');
  // }

  // Get the current step title
  const stepTitles: Record<EditArtworkStateValue, string> = {
    dimensions: 'Dimensions',
    selection: 'Selection',
    details: 'Details',
    review: 'Review',
  };
  const currentStep = Object.keys(stepTitles).find(key =>
    state.matches(key as EditArtworkStateValue),
  ) as EditArtworkStateValue;
  const currentStepTitle = stepTitles[currentStep ?? 'review'];

  return (
    <FormModal.Root
      overlayClassName={styles.overlay}
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Artwork"
      description={currentStepTitle}
      abandonDialogProps={{
        title: 'Abandon Edits',
        description: 'Are you sure you want to abandon editings this artwork?',
        hint: 'Your work can not be recovered.',
        action: (
          <Button danger filled>
            Abandon
          </Button>
        ),
      }}
      getIsDirty={() => screenRef.current?.getIsDirty() ?? false}
      trigger={trigger}>
      {renderStep()}
    </FormModal.Root>
  );
};
