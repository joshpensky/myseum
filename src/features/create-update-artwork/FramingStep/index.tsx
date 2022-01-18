import { FormEvent } from 'react';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmFramingEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';

interface FramingStepProps {
  state: CreateUpdateArtworkState<'framing'>;
  onBack(): void;
  onSubmit(data: ConfirmFramingEvent): void;
}

export const FramingStep = ({ state, onBack, onSubmit }: FramingStepProps) => {
  const onFormSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    onSubmit({
      type: 'CONFIRM_FRAMING',
      framing: {
        hasFrame: false,
        depth: 1,
        unit: 'inch',
      },
    });
  };

  return (
    <div className={styles.content}>
      <h3 className={styles.contentTitle}>Framing</h3>
      <p className={styles.contentDescription}>Choose a framing option for the artwork.</p>

      <form className={styles.form} onSubmit={onFormSubmit}>
        <div className={styles.activeContent}>
          <img src={state.context.selection.preview.src} alt="" />
        </div>

        <div className={styles.formActions}>
          <Button size="large" type="button" onClick={onBack}>
            Back
          </Button>

          <Button size="large" type="submit" filled>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};
