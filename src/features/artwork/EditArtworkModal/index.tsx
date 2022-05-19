import { ReactNode, useState } from 'react';
import { useMachine } from '@xstate/react';
import equal from 'fast-deep-equal';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { SelectionEditorState } from '@src/features/selection';
import { ReviewScreen } from './01-ReviewScreen';
import { DimensionsScreen } from './02a-DimensionsScreen';
import { SelectionScreen } from './02b-SelectionScreen';
import { DetailsScreen } from './02c-DetailsScreen';
import styles from './editArtworkModal.module.scss';
import { EditArtworkContext, editArtworkMachine, EditArtworkStateValue } from './state';

export interface CreateArtworkModalProps {
  artwork: ArtworkDto;
  trigger: ReactNode;
  onComplete(data: ArtworkDto): void;
}

export const EditArtworkModal = ({ artwork, onComplete, trigger }: CreateArtworkModalProps) => {
  const initialContext: EditArtworkContext = {
    id: artwork.id,
    dimensions: {
      width: artwork.size.width,
      height: artwork.size.height,
      depth: artwork.size.depth,
      unit: artwork.unit,
    },
    selection: {
      path: SelectionEditorState.DEFAULT_INITIAL_SNAPSHOT.outline,
      preview: artwork.src,
    },
    details: {
      title: artwork.title,
      // artist,
      description: artwork.description,
      altText: artwork.alt,
      createdAt: artwork.createdAt ?? undefined,
      acquiredAt: artwork.acquiredAt,
    },
  };

  const [state, send] = useMachine(() => editArtworkMachine.withContext(initialContext));

  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      send({ type: 'RESET', context: initialContext });
    }
  };

  const handleBack = () => {
    if (state.can('GO_BACK')) {
      send({ type: 'GO_BACK' });
    }
  };

  const renderStep = () => {
    if (state.matches('review')) {
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
    } else if (state.matches('dimensions')) {
      return <DimensionsScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else if (state.matches('selection')) {
      return <SelectionScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else if (state.matches('details')) {
      return <DetailsScreen state={state} onBack={handleBack} onSubmit={data => send(data)} />;
    } else {
      throw new Error('Form has entered unknown state.');
    }
  };

  // Get the current step title
  const stepTitles: Record<EditArtworkStateValue, string | undefined> = {
    dimensions: 'Dimensions',
    selection: 'Selection',
    details: 'Details',
    review: undefined,
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
      getIsDirty={() => !state.matches('review') || !equal(state.context, initialContext)}
      trigger={trigger}>
      {renderStep()}
    </FormModal.Root>
  );
};
