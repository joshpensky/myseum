import cx from 'classnames';
import { Field, Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmFramingEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import stepStyles from './framingStep.module.scss';

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

        return (
          <Form className={styles.form}>
            <div className={cx(styles.activeContent, stepStyles.activeContent)}>
              <img
                className={stepStyles.preview}
                src={state.context.selection.preview.src}
                alt=""
              />
            </div>

            <div className={stepStyles.radioGroup}>
              <Field
                id="hasFrame-false"
                type="radio"
                name="hasFrame"
                required
                value="false"
                checked={values.hasFrame === false}
                onChange={() => setFieldValue('hasFrame', false)}
              />
              <label htmlFor="hasFrame-false">No Frame</label>

              <fieldset disabled={values.hasFrame !== false}>
                <legend className="sr-only">No Frame</legend>
                <p>Adjust the depth of the piece.</p>

                <label htmlFor="depth">Depth</label>
                <Field id="depth" name="depth" type="number" aria-describedby="depth-unit" />
                <div id="depth-unit" aria-hidden="true">
                  inches
                </div>
              </fieldset>
            </div>

            <div className={stepStyles.radioGroup}>
              <Field
                id="hasFrame-true"
                type="radio"
                name="hasFrame"
                required
                value="true"
                checked={values.hasFrame === true}
                onChange={() => setFieldValue('hasFrame', true)}
              />
              <label htmlFor="hasFrame-true">Framed</label>

              <fieldset disabled={values.hasFrame !== true}>
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
