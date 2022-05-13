import { Fragment } from 'react';
import * as Slider from '@radix-ui/react-slider';
import cx from 'classnames';
import { Field, useFormikContext } from 'formik';
import { FieldWrapper } from '@src/components/FieldWrapper';
import { FramingScreenSchema } from '@src/features/gallery/AddArtworkModal/FramingScreen';
import styles from './framingOptions.module.scss';

export const FramingOptions = () => {
  const { values, setFieldValue } = useFormikContext<FramingScreenSchema>();

  const scaledSelectedOptionIdx = values.framingOptions.isScaled ? 1 : 0;
  const mattingSelectedOptionIdx = {
    none: 0,
    light: 1,
    dark: 2,
  }[values.framingOptions.matting];

  return (
    <Fragment>
      <h4 className={cx(styles.title, !values.frame && styles.disabled)}>Framing Options</h4>
      <p className={cx(styles.description, !values.frame && styles.disabled)}>
        Customize how your artwork appears in the frame.
      </p>

      <fieldset className={styles.fieldGroup} disabled={!values.frame}>
        <legend className={styles.label}>Artwork Size</legend>

        <div
          className={styles.radioGroup}
          style={{ '--options': 2, '--selected-index': scaledSelectedOptionIdx }}>
          <Field
            id="framingOptions.isScaled-false"
            name="framingOptions.isScaled"
            className="sr-only"
            type="radio"
            value="false"
            checked={!values.framingOptions.isScaled}
            onChange={() => setFieldValue('framingOptions.isScaled', false)}
          />
          <label htmlFor="framingOptions.scaled-false" className={styles.radioGroupItem}>
            Actual Size
          </label>

          <Field
            id="framingOptions.isScaled-true"
            name="framingOptions.isScaled"
            className="sr-only"
            type="radio"
            value="true"
            checked={values.framingOptions.isScaled}
            onChange={() => setFieldValue('framingOptions.isScaled', true)}
          />
          <label htmlFor="framingOptions.isScaled-true" className={styles.radioGroupItem}>
            Scaled
          </label>
        </div>
      </fieldset>

      <FieldWrapper
        className={styles.fieldGroup}
        name="framingOptions.scaling"
        label="Scale"
        required
        disabled={!values.frame || !values.framingOptions.isScaled}>
        {field => (
          <Slider.Root
            {...field}
            className={styles.slider}
            min={20}
            max={100}
            value={[values.framingOptions.scaling]}
            onValueChange={([scaling]) => setFieldValue('framingOptions.scaling', scaling)}>
            <Slider.Track className={styles.sliderTrack}>
              <Slider.Range className={styles.sliderRange} />
            </Slider.Track>
            <Slider.Thumb className={styles.sliderThumb} />
          </Slider.Root>
        )}
      </FieldWrapper>

      <fieldset className={styles.fieldGroup} disabled={!values.frame}>
        <legend className={styles.label}>Matting</legend>

        <div
          className={styles.radioGroup}
          style={{ '--options': 3, '--selected-index': mattingSelectedOptionIdx }}>
          <Field
            id="framingOptions.matting-none"
            name="framingOptions.matting"
            className="sr-only"
            type="radio"
            value="none"
          />
          <label htmlFor="framingOptions.matting-none" className={styles.radioGroupItem}>
            None
          </label>

          <Field
            id="framingOptions.matting-light"
            name="framingOptions.matting"
            className="sr-only"
            type="radio"
            value="light"
          />
          <label htmlFor="framingOptions.matting-light" className={styles.radioGroupItem}>
            <span className={cx(styles.swatch, styles.swatchLight)} />
            Light
          </label>

          <Field
            id="framingOptions.matting-dark"
            name="framingOptions.matting"
            className="sr-only"
            type="radio"
            value="dark"
          />
          <label htmlFor="framingOptions.matting-dark" className={styles.radioGroupItem}>
            <span className={cx(styles.swatch, styles.swatchDark)} />
            Dark
          </label>
        </div>
      </fieldset>
    </Fragment>
  );
};
