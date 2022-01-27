import { ChangeEvent } from 'react';
import { MeasureUnit } from '@prisma/client';
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
import Close from '@src/svgs/Close';
import Lightbulb from '@src/svgs/Lightbulb';
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

interface DimensionsStepProps {
  state: CreateArtworkState<'dimensions'>;
  onBack(): void;
  onSubmit(data: ConfirmDimensionsEvent): void;
}

export const DimensionsStep = ({ state, onBack, onSubmit }: DimensionsStepProps) => {
  const initialValues: DimensionsStepSchema = {
    width: state.context.dimensions.width ?? 0,
    height: state.context.dimensions.height ?? 0,
    unit: state.context.dimensions.unit ?? 'in',
  };

  const initialErrors = validateZodSchema(dimensionsStepSchema, 'sync')(initialValues);

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
        const { handleChange, isSubmitting, isValid, setFieldValue } = formik;

        return (
          <Form className={rootStyles.form} noValidate>
            <div className={rootStyles.activeContent}></div>

            <div className={styles.row}>
              <FieldWrapper name="width" label="Width" required>
                {field => (
                  <TextField
                    {...field}
                    type="number"
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
