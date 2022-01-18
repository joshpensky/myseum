import { FormEvent, useState } from 'react';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmDimensionsEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import type { Measurement } from '@src/types';

interface DimensionsStepProps {
  state: CreateUpdateArtworkState<'dimensions'>;
  onBack(): void;
  onSubmit(data: ConfirmDimensionsEvent): void;
}

export const DimensionsStep = ({ state, onBack, onSubmit }: DimensionsStepProps) => {
  const [width, setWidth] = useState(state.context.dimensions.width);
  const [height, setHeight] = useState(state.context.dimensions.height);
  const [unit, setUnit] = useState(state.context.dimensions.unit);

  const onFormSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    onSubmit({
      type: 'CONFIRM_DIMENSIONS',
      dimensions: {
        width,
        height,
        unit,
      },
    });
  };

  return (
    <div className={styles.content}>
      <h3 className={styles.contentTitle}>Dimensions</h3>
      <p className={styles.contentDescription}>Adjust to match the size of your artwork.</p>

      <form className={styles.form} onSubmit={onFormSubmit}>
        <div className={styles.activeContent}></div>

        <label htmlFor="width">Width</label>
        <input
          id="width"
          name="width"
          type="number"
          value={width}
          required
          onChange={evt => setWidth(evt.target.valueAsNumber)}
        />

        <label htmlFor="height">Height</label>
        <input
          id="height"
          name="height"
          type="number"
          value={height}
          required
          onChange={evt => setHeight(evt.target.valueAsNumber)}
        />

        <label htmlFor="unit">Unit</label>
        <select
          id="unit"
          name="unit"
          value={unit}
          required
          onChange={evt => setUnit(evt.target.value as Measurement)}>
          <option value="inch">inches</option>
          <option value="cm">centimeters</option>
        </select>

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
