import { ChangeEvent, useRef, useState } from 'react';
import { MeasureUnit } from '@prisma/client';
import cx from 'classnames';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import { Select } from '@src/components/Select';
import { TextField } from '@src/components/TextField__New';
import rootStyles from '@src/features/create-artwork/root.module.scss';
import type {
  ConfirmDimensionsEvent,
  CreateArtworkState,
} from '@src/features/create-artwork/state';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import Close from '@src/svgs/Close';
import Lightbulb from '@src/svgs/Lightbulb';
import { Dimensions } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { convertUnit } from '@src/utils/convertUnit';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './dimensionsStep.module.scss';

const dimensionsStepSchema = z.object({
  width: z
    .number({ required_error: 'Width is required.' })
    .positive('Width must be greater than 0.'),

  height: z
    .number({ required_error: 'Height is required.' })
    .positive('Height must be greater than 0.'),

  unit: z.nativeEnum(MeasureUnit, {
    invalid_type_error: 'Invalid unit.',
    required_error: 'Unit is required.',
  }),
});

type DimensionsStepSchema = z.infer<typeof dimensionsStepSchema>;

interface Preset {
  value: string;
  display: string;
  dimensions: DimensionsStepSchema;
}

const presets: Preset[] = [
  {
    value: 'a4',
    display: 'A4',
    dimensions: {
      width: 210,
      height: 297,
      unit: 'mm',
    },
  },
  {
    value: 'poster',
    display: 'Poster',
    dimensions: {
      width: 11,
      height: 17,
      unit: 'in',
    },
  },
];

interface DimensionsStepProps {
  state: CreateArtworkState<'dimensions'>;
  onBack(): void;
  onSubmit(data: ConfirmDimensionsEvent): void;
}

export const DimensionsStep = ({ state, onBack, onSubmit }: DimensionsStepProps) => {
  // Track preview area dimensions on resize
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const [previewAreaDimensions, setPreviewAreaDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  useIsomorphicLayoutEffect(() => {
    if (previewAreaRef.current) {
      const observer = new ResizeObserver(entries => {
        const [previewArea] = entries;
        setPreviewAreaDimensions({
          height: previewArea.contentRect.height,
          width: previewArea.contentRect.width,
        });
      });
      observer.observe(previewAreaRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const initialValues: DimensionsStepSchema = {
    width: state.context.dimensions.width ?? 0,
    height: state.context.dimensions.height ?? 0,
    unit: state.context.dimensions.unit ?? 'in',
  };

  const initialErrors = validateZodSchema(dimensionsStepSchema, 'sync')(initialValues);

  return (
    <Formik<DimensionsStepSchema>
      initialValues={initialValues}
      initialErrors={initialErrors}
      validate={validateZodSchema(dimensionsStepSchema)}
      onSubmit={values => {
        onSubmit({
          type: 'CONFIRM_DIMENSIONS',
          dimensions: {
            width: values.width,
            height: values.height,
            unit: values.unit,
          },
        });
      }}>
      {formik => {
        const { handleChange, isSubmitting, isValid, values, setFieldValue } = formik;

        const unitPxRatio = convertUnit(1, values.unit, 'px');
        const pxDimensions: Dimensions = {
          width: values.width * unitPxRatio,
          height: values.height * unitPxRatio,
        };

        const previewDimensions = CanvasUtils.objectScaleDown(previewAreaDimensions, pxDimensions);
        const previewRatio = previewDimensions.width / pxDimensions.width;
        const previewUnitSize = previewRatio * unitPxRatio;

        return (
          <Form className={rootStyles.form} noValidate>
            <div className={rootStyles.activeContent}>
              <div ref={previewAreaRef} className={styles.preview}>
                <div
                  className={cx(
                    styles.previewBox,
                    previewAreaDimensions.width === 0 && styles.previewBoxHidden,
                  )}
                  style={{
                    '--width': `${previewDimensions.width}px`,
                    '--height': `${previewDimensions.height}px`,
                    // Disable grid when unit is 'px'
                    '--unit': values.unit === 'px' ? 0 : `${previewUnitSize}px`,
                  }}
                />
              </div>
            </div>

            <div className={styles.row}>
              <FieldWrapper name="width" label="Width" required>
                {field => (
                  <TextField
                    {...field}
                    type="number"
                    min={0}
                    onChange={evt => {
                      handleChange(evt);
                      setFieldValue('preset', 'custom');
                    }}
                  />
                )}
              </FieldWrapper>

              <div className={styles.timesIcon}>
                <Close />
              </div>

              <FieldWrapper name="height" label="Height" required>
                {field => (
                  <TextField
                    {...field}
                    type="number"
                    min={0}
                    onChange={evt => {
                      handleChange(evt);
                      setFieldValue('preset', 'custom');
                    }}
                  />
                )}
              </FieldWrapper>
            </div>

            <div className={styles.row}>
              <FieldWrapper name="unit" label="Unit" required>
                {field => (
                  <Select<MeasureUnit>
                    {...field}
                    options={[
                      { value: 'px', display: 'pixels' },
                      { value: 'in', display: 'inches' },
                      { value: 'cm', display: 'centimeters' },
                      { value: 'mm', display: 'millimeters' },
                    ]}
                    onChange={evt => {
                      handleChange(evt);
                      setFieldValue('preset', 'custom');
                    }}
                  />
                )}
              </FieldWrapper>
            </div>

            <div className={styles.hint}>
              <div className={styles.hintIcon}>
                <Lightbulb />
              </div>

              <p className={styles.hintText}>
                Is your artwork a standard size? Use one of the below presets.
              </p>

              <FieldWrapper name="preset" label="Preset" labelClassName="sr-only">
                {field => (
                  <Select<string>
                    {...field}
                    options={[{ value: 'custom', display: 'Custom' }, ...presets]}
                    onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                      handleChange(evt);
                      const preset = presets.find(preset => preset.value === evt.target.value);
                      if (preset) {
                        setFieldValue('width', preset.dimensions.width);
                        setFieldValue('height', preset.dimensions.height);
                        setFieldValue('unit', preset.dimensions.unit);
                      }
                    }}
                  />
                )}
              </FieldWrapper>
            </div>

            <div className={rootStyles.formActions}>
              <Button size="large" type="button" onClick={onBack}>
                Back
              </Button>

              <Button size="large" type="submit" filled disabled={!isValid || isSubmitting}>
                Next
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
