import { useState } from 'react';
import { MeasureUnit } from '@prisma/client';
import cx from 'classnames';
import { Field, Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import { Preview3d } from '@src/components/Preview3d';
import { Select } from '@src/components/Select';
import { TextField } from '@src/components/TextField__New';
import rootStyles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmFramingEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import Checkmark from '@src/svgs/Checkmark';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './framingStep.module.scss';

interface FramingStepProps {
  state: CreateUpdateArtworkState<'framing'>;
  onBack(): void;
  onSubmit(data: ConfirmFramingEvent): void;
}

const framingStepSchema = z
  .object({
    hasFrame: z.boolean({ required_error: 'You must select a framing option.' }),

    depth: z.number().nonnegative('Depth must be greater than or equal to 0.'),

    frameId: z.number().optional(),
  })
  .refine(data => !data.hasFrame || typeof data.frameId === 'number', {
    message: 'You must select a frame.',
    path: ['frameId'],
  });

type FramingStepSchema = z.infer<typeof framingStepSchema>;

export const FramingStep = ({ state, onBack, onSubmit }: FramingStepProps) => {
  const initialValues: FramingStepSchema = {
    hasFrame: state.context.framing?.hasFrame ?? (undefined as any),
    depth: state.context.framing?.depth ?? 0,
    frameId: state.context.framing?.frame?.id ?? undefined,
  };

  const initialErrors = validateZodSchema(framingStepSchema, 'sync')(initialValues);

  return (
    <Formik<FramingStepSchema>
      initialValues={initialValues}
      initialErrors={initialErrors}
      validate={validateZodSchema(framingStepSchema)}
      onSubmit={values => {
        if (values.hasFrame) {
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
              depth: values.depth,
            },
          });
        }
      }}>
      {formik => {
        const { values, setFieldValue, isSubmitting, isValid } = formik;

        const [rotated, setRotated] = useState(false);
        const [isDepthFocused, setIsDepthFocused] = useState(false);

        let previewDepth = 0;
        if (values.hasFrame === false) {
          previewDepth = values.depth;
        }

        return (
          <Form className={rootStyles.form} noValidate>
            <div className={cx(rootStyles.activeContent, styles.activeContent)}>
              <div className={styles.preview}>
                <Preview3d
                  rotated={rotated || isDepthFocused}
                  artwork={{
                    src: state.context.selection.preview.src,
                    alt: 'Preview of the uploaded artwork',
                    size: {
                      width: state.context.dimensions.width,
                      height: state.context.dimensions.height,
                      depth: previewDepth,
                    },
                  }}
                />
              </div>

              <Button type="button" onClick={() => setRotated(!rotated)}>
                Rotate
              </Button>
            </div>

            <div className={styles.radioGroup}>
              <Field
                id="hasFrame-false"
                className="sr-only"
                type="radio"
                name="hasFrame"
                required
                value="false"
                checked={values.hasFrame === false}
                onChange={() => setFieldValue('hasFrame', false)}
              />

              <label className={styles.radioGroupLabel} htmlFor="hasFrame-false">
                <span className={styles.radioGroupButton} aria-hidden="true">
                  <Checkmark />
                </span>
                No Frame
              </label>

              <fieldset className={styles.radioGroupFieldset} disabled={values.hasFrame !== false}>
                <legend className="sr-only">No Frame</legend>
                <p className={styles.radioGroupDescription}>Adjust the depth of the piece.</p>

                <div className={styles.fieldRow}>
                  <FieldWrapper className={styles.fieldRowItem} name="depth" label="Depth" required>
                    {field => (
                      <TextField
                        {...field}
                        type="number"
                        min={0}
                        onFocus={() => setIsDepthFocused(true)}
                        onBlur={() => setIsDepthFocused(false)}
                      />
                    )}
                  </FieldWrapper>

                  <FieldWrapper
                    className={styles.fieldRowItem}
                    name="depth-unit"
                    label="Unit"
                    disabled
                    required>
                    {field => (
                      <Select<MeasureUnit>
                        {...field}
                        options={[
                          { value: 'in', display: 'inches' },
                          { value: 'cm', display: 'centimeters' },
                          { value: 'mm', display: 'millimeters' },
                        ]}
                      />
                    )}
                  </FieldWrapper>
                </div>
              </fieldset>

              <div className={styles.radioGroupFrame} />
            </div>

            <div className={styles.radioGroup}>
              <Field
                id="hasFrame-true"
                className="sr-only"
                type="radio"
                name="hasFrame"
                required
                value="true"
                checked={values.hasFrame === true}
                onChange={() => setFieldValue('hasFrame', true)}
              />

              <label className={styles.radioGroupLabel} htmlFor="hasFrame-true">
                <span className={styles.radioGroupButton} aria-hidden="true">
                  <Checkmark />
                </span>
                Framed
              </label>

              <fieldset className={styles.radioGroupFieldset} disabled={values.hasFrame !== true}>
                <legend className="sr-only">Framed</legend>
                <p className={styles.radioGroupDescription}>Create or choose an existing frame.</p>

                {/* TODO: frame selection */}

                <Button className={styles.createButton} size="large" type="button">
                  Create frame
                </Button>
              </fieldset>

              <div className={styles.radioGroupFrame} />
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
