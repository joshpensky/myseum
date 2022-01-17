import { FormEvent, ReactNode, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import cx from 'classnames';
import Button from '@src/components/Button';
import IconButton from '@src/components/IconButton';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Close from '@src/svgs/Close';
import styles from './root.module.scss';

interface CreateUpdateArtworkProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  trigger: ReactNode;
}

export const CreateUpdateArtwork = ({ open, onOpenChange, trigger }: CreateUpdateArtworkProps) => {
  const [stepIdx, setStepIdx] = useState(0);
  const stepsCount = 6;

  const onFormSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (stepIdx === stepsCount - 1) {
      onOpenChange(false);
    } else {
      setStepIdx(stepIdx + 1);
    }
  };

  const goBack = () => {
    setStepIdx(Math.max(0, stepIdx - 1));
  };

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setStepIdx(0);
    }
  }, [open]);

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
                  style={{ '--stepper-progress': (stepIdx + 1) / 6 }}>
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
                      Step {stepIdx + 1} of {stepsCount}
                    </p>
                  </div>
                </header>

                <div className={styles.content}>
                  <h3 className={styles.contentTitle}>Upload</h3>
                  <p className={styles.contentDescription}>
                    Add a photo of the artwork to get started.
                  </p>

                  <form className={styles.form} onSubmit={onFormSubmit}>
                    <div className={styles.activeContent}>
                      <input type="file" />
                    </div>

                    <div className={styles.formActions}>
                      {stepIdx > 0 && (
                        <Button size="large" type="button" onClick={goBack}>
                          Back
                        </Button>
                      )}
                      <Button size="large" type="submit" filled>
                        Next
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </ThemeProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
