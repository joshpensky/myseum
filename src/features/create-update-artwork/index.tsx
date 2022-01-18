import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMachine } from '@xstate/react';
import cx from 'classnames';
import IconButton from '@src/components/IconButton';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Close from '@src/svgs/Close';
import { DetailsStep } from './DetailsStep';
import { DimensionsStep } from './DimensionsStep';
import { FramingStep } from './FramingStep';
import { ReviewStep } from './ReviewStep';
import { SelectionStep } from './SelectionStep';
import { UploadStep } from './UploadStep';
import styles from './root.module.scss';
import { createUpdateArtworkMachine, CreateUpdateArtworkStateValue } from './state';

interface CreateUpdateArtworkProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  trigger: ReactNode;
}

export const CreateUpdateArtwork = ({ open, onOpenChange, trigger }: CreateUpdateArtworkProps) => {
  const [state, send] = useMachine(() =>
    createUpdateArtworkMachine.withContext({
      upload: undefined,
      dimensions: undefined,
      selection: undefined,
      framing: undefined,
      details: undefined,
    }),
  );

  const onBack = () => {
    if (state.can('GO_BACK')) {
      send({ type: 'GO_BACK' });
    }
  };

  const renderStep = () => {
    if (state.matches('upload')) {
      return <UploadStep state={state} onSubmit={data => send(data)} />;
    } else if (state.matches('dimensions')) {
      return <DimensionsStep state={state} onBack={onBack} onSubmit={data => send(data)} />;
    } else if (state.matches('selection')) {
      return <SelectionStep state={state} onBack={onBack} onSubmit={data => send(data)} />;
    } else if (state.matches('framing')) {
      return <FramingStep state={state} onBack={onBack} onSubmit={data => send(data)} />;
    } else if (state.matches('details')) {
      return <DetailsStep state={state} onBack={onBack} onSubmit={data => send(data)} />;
    } else if (state.matches('review')) {
      return <ReviewStep state={state} onSubmit={data => send(data)} />;
    } else {
      return null;
    }
  };

  // // Reset state on close
  // useEffect(() => {
  //   if (!open) {
  //     // TODO: reset state
  //   }
  // }, [open]);

  // Get the current step index (sans 'complete')
  const stepKeys: CreateUpdateArtworkStateValue[] = [
    'upload',
    'dimensions',
    'selection',
    'framing',
    'details',
    'review',
  ];
  let stepIdx = stepKeys.findIndex(value => state.matches(value));
  stepIdx = Math.max(0, stepIdx);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <ThemeProvider theme={{ color: 'ink' }}>
            <div className={cx('theme--ink', styles.root)}>
              <div className={styles.activeArea} />

              <div className={styles.formArea}>
                <header
                  className={styles.header}
                  style={{ '--stepper-progress': (stepIdx + 1) / stepKeys.length }}>
                  <div className={styles.headerClose}>
                    <Dialog.Close asChild>
                      <IconButton title="Close">
                        <Close />
                      </IconButton>
                    </Dialog.Close>
                  </div>

                  <div className={styles.headerTitles}>
                    <Dialog.Title asChild>
                      <h2 className={styles.headerTitlesMain}>Add Artwork</h2>
                    </Dialog.Title>
                    <p className={styles.headerTitlesSub}>
                      Step {stepIdx + 1} of {stepKeys.length}
                    </p>
                  </div>
                </header>

                {renderStep()}
              </div>
            </div>
          </ThemeProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
