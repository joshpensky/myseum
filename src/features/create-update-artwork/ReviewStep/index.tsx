import { FormEvent } from 'react';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmReviewEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';

interface ReviewStepProps {
  state: CreateUpdateArtworkState<'review'>;
  onSubmit(data: ConfirmReviewEvent): void;
}

export const ReviewStep = ({ state, onSubmit }: ReviewStepProps) => {
  const onFormSubmit = async (evt: FormEvent) => {
    evt.preventDefault();

    // TODO: send to API

    onSubmit({
      type: 'CONFIRM_REVIEW',
    });
  };

  return (
    <div className={styles.content}>
      <h3 className={styles.contentTitle}>Review</h3>
      <p className={styles.contentDescription}>Make any last edits and confirm your selections.</p>

      <form className={styles.form} onSubmit={onFormSubmit}>
        <div className={styles.activeContent}>
          <img src={state.context.selection.preview.src} alt="" />
        </div>

        <div className={styles.formActions}>
          <Button size="large" type="submit" filled>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};
