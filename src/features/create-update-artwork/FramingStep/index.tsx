import { FormEvent, useState } from 'react';
import cx from 'classnames';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmFramingEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import stepStyles from './framingStep.module.scss';

interface FramingStepProps {
  state: CreateUpdateArtworkState<'framing'>;
  onBack(): void;
  onSubmit(data: ConfirmFramingEvent): void;
}

export const FramingStep = ({ state, onBack, onSubmit }: FramingStepProps) => {
  const [hasFrame, setHasFrame] = useState(state.context.framing?.hasFrame);
  const [depth, setDepth] = useState(state.context.framing?.depth ?? 0);

  const onFormSubmit = (evt: FormEvent) => {
    evt.preventDefault();

    if (hasFrame) {
      // onSubmit({
      //   type: 'CONFIRM_FRAMING',
      //   framing: {
      //     hasFrame: true,
      //     frame: { ... }, // TODO: choose frame from API
      //   },
      // });
    } else {
      onSubmit({
        type: 'CONFIRM_FRAMING',
        framing: {
          hasFrame: false,
          depth,
        },
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={onFormSubmit}>
      <div className={cx(styles.activeContent, stepStyles.activeContent)}>
        <img className={stepStyles.preview} src={state.context.selection.preview.src} alt="" />
      </div>

      <div className={stepStyles.radioGroup}>
        <input
          id="hasFrame-false"
          type="radio"
          name="hasFrame"
          checked={hasFrame === false}
          required
          onChange={evt => setHasFrame(!evt.target.checked)}
        />
        <label htmlFor="hasFrame-false">No Frame</label>

        <fieldset disabled={hasFrame !== false}>
          <legend className="sr-only">No Frame</legend>
          <p>Adjust the depth of the piece.</p>

          <label htmlFor="depth">Depth</label>
          <input
            id="depth"
            name="depth"
            type="number"
            value={depth}
            onChange={evt => setDepth(evt.target.valueAsNumber)}
          />
          <div>inches</div>
        </fieldset>
      </div>

      <div className={stepStyles.radioGroup}>
        <input
          id="hasFrame-true"
          type="radio"
          name="hasFrame"
          checked={hasFrame === true}
          required
          onChange={evt => setHasFrame(evt.target.checked)}
        />
        <label htmlFor="hasFrame-true">Framed</label>

        <fieldset disabled={hasFrame !== true}>
          <legend className="sr-only">Framed</legend>
          <p>Create or choose an existing frame.</p>

          {/* TODO: frame selection */}

          <Button size="large" type="button">
            Create frame
          </Button>
        </fieldset>
      </div>

      <div className={styles.formActions}>
        <Button size="large" type="button" onClick={onBack}>
          Back
        </Button>

        <Button size="large" type="submit" filled disabled={typeof hasFrame === 'undefined'}>
          Next
        </Button>
      </div>
    </form>
  );
};
