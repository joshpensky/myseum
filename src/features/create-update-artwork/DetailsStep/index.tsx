import { FormEvent, useState } from 'react';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmDetailsEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';

interface DetailsStepProps {
  state: CreateUpdateArtworkState<'details'>;
  onBack(): void;
  onSubmit(data: ConfirmDetailsEvent): void;
}

export const DetailsStep = ({ state, onBack, onSubmit }: DetailsStepProps) => {
  const [title, setTitle] = useState(state.context.details?.title ?? '');
  const [artist, setArtist] = useState(state.context.details?.artist ?? '');
  const [description, setDescription] = useState(state.context.details?.description ?? '');
  const [altText, setAltText] = useState(state.context.details?.altText ?? '');
  const [createdAt, setCreatedAt] = useState(state.context.details?.createdAt ?? new Date());
  const [acquiredAt, setAcquiredAt] = useState(state.context.details?.acquiredAt ?? new Date());

  const onFormSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    onSubmit({
      type: 'CONFIRM_DETAILS',
      details: {
        title,
        description,
        artist,
        altText,
        createdAt,
        acquiredAt,
      },
    });
  };

  return (
    <div className={styles.content}>
      <h3 className={styles.contentTitle}>Details</h3>
      <p className={styles.contentDescription}>Fill in some information about the artwork.</p>

      <form className={styles.form} onSubmit={onFormSubmit}>
        <div className={styles.activeContent}>
          <img src={state.context.selection.preview.src} alt="" />
        </div>

        <label htmlFor="title">Title</label>
        <input id="title" required value={title} onChange={evt => setTitle(evt.target.value)} />

        <label htmlFor="artist">Artist</label>
        <input id="artist" value={artist} onChange={evt => setArtist(evt.target.value)} />

        <label htmlFor="description">Description</label>
        <input
          id="description"
          required
          value={description}
          onChange={evt => setDescription(evt.target.value)}
        />

        <label htmlFor="altText">Alt Text</label>
        <input
          id="altText"
          required
          value={altText}
          onChange={evt => setAltText(evt.target.value)}
        />

        <label htmlFor="createdAt">Created</label>
        <input
          id="createdAt"
          type="date"
          value={createdAt.toDateString()}
          onChange={evt => setCreatedAt(evt.target.valueAsDate ?? new Date())}
        />

        <label htmlFor="acquiredAt">Acquired</label>
        <input
          id="acquiredAt"
          type="date"
          required
          value={acquiredAt.toDateString()}
          onChange={evt => setAcquiredAt(evt.target.valueAsDate ?? new Date())}
        />

        <div className={styles.formActions}>
          <Button size="large" type="button" onClick={onBack}>
            Back
          </Button>

          <Button size="large" type="submit" filled disabled={!title || !description || !altText}>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};
