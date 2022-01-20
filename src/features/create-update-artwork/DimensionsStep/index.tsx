import { MeasureUnit } from '@prisma/client';
import { Field, Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmDimensionsEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import { validateZodSchema } from '@src/utils/validateZodSchema';

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

interface DimensionsStepProps {
  state: CreateUpdateArtworkState<'dimensions'>;
  onBack(): void;
  onSubmit(data: ConfirmDimensionsEvent): void;
}

export const DimensionsStep = ({ state, onBack, onSubmit }: DimensionsStepProps) => {
  const initialValues: DimensionsStepSchema = {
    width: state.context.dimensions.width ?? 0,
    height: state.context.dimensions.height ?? 0,
    unit: state.context.dimensions.unit ?? 'in',
  };

  return (
    <Formik<DimensionsStepSchema>
      initialValues={initialValues}
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
        const { isSubmitting, isValid } = formik;

        return (
          <Form className={styles.form}>
            <div className={styles.activeContent}></div>

            <label htmlFor="width">Width</label>
            <Field id="width" name="width" type="number" required />

            <label htmlFor="height">Height</label>
            <Field id="height" name="height" type="number" required />

            <label htmlFor="unit">Unit</label>
            <Field as="select" id="unit" name="unit" required>
              <option value="in">inches</option>
              <option value="cm">centimeters</option>
            </Field>

            <div className={styles.formActions}>
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
