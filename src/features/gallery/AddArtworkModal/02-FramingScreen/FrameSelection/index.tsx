import { Fragment } from 'react';
import { Field } from 'formik';
import useSWR from 'swr';
import api from '@src/api';
import Button from '@src/components/Button';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { CreateFrameModal } from '@src/features/frame/CreateFrameModal';
import { useAuth } from '@src/providers/AuthProvider';
import { CheckmarkIcon } from '@src/svgs/icons/CheckmarkIcon';
import { getImageUrl } from '@src/utils/getImageUrl';
import styles from './frameSelection.module.scss';

export interface FrameSelectionProps {
  value?: Omit<FrameDto, 'owner' | 'addedAt' | 'modifiedAt'>;
  onChange(data: Omit<FrameDto, 'owner'>): void;
}

export const FrameSelection = ({ value, onChange }: FrameSelectionProps) => {
  const auth = useAuth();

  const frames = useSWR<FrameDto[]>(auth.user ? `/api/user/${auth.user.id}/frames` : null, {
    revalidateOnFocus: false,
    async fetcher() {
      if (!auth.user) {
        return [];
      }
      return await api.frame.findAllByUser(auth.user);
    },
  });

  const renderFrames = () => {
    if (frames.isValidating) {
      return (
        <div className={styles.loading}>
          {new Array(4).fill(null).map((_, idx) => (
            <div key={idx} aria-hidden="true" />
          ))}
          <span className="sr-only">Loading</span>
        </div>
      );
    }

    if (!frames.data || frames.error) {
      return (
        <div className={styles.message}>
          <p>There was an issue fetching frames.</p>
          <Button type="button" onClick={() => frames.revalidate()}>
            Retry
          </Button>
        </div>
      );
    }

    if (!frames.data.length) {
      return (
        <div className={styles.message}>
          <p>No frames available.</p>
        </div>
      );
    }

    return (
      <div className={styles.listWrapper}>
        <ul className={styles.list}>
          {frames.data.map(frame => (
            <li key={frame.id} className={styles.listItem}>
              <Field
                id={`frame-${frame.id}`}
                name="frame"
                className="sr-only"
                type="radio"
                checked={value?.id === frame.id}
                onChange={() => onChange(frame)}
              />
              <label htmlFor={`frame-${frame.id}`} className={styles.frame}>
                <span className="sr-only">{frame.name}</span>
                <img
                  className={styles.framePreview}
                  src={getImageUrl('frames', frame.src)}
                  alt={frame.alt}
                />
                <span className={styles.frameCheckmark}>
                  <CheckmarkIcon />
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Fragment>
      {renderFrames()}
      <CreateFrameModal
        onComplete={() => {
          frames.revalidate();
        }}
        trigger={
          <Button className={styles.createButton} type="button">
            Create frame
          </Button>
        }
      />
    </Fragment>
  );
};
