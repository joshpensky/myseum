import { Field } from 'formik';
import useSWR from 'swr';
import Button from '@src/components/Button';
import { FrameDto } from '@src/data/FrameSerializer';
import Checkmark from '@src/svgs/Checkmark';
import styles from './frameSelection.module.scss';

export interface FrameSelectionProps {
  value?: FrameDto;
  onChange(data: FrameDto): void;
}

export const FrameSelection = ({ value, onChange }: FrameSelectionProps) => {
  const frames = useSWR<FrameDto[]>('/api/frames', {
    revalidateOnFocus: false,
  });

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
              <span className="sr-only">{frame.description}</span>
              <img className={styles.framePreview} src={frame.src} alt="" />
              <span className={styles.frameCheckmark}>
                <Checkmark />
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};
