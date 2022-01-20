import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmDetailsEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import { validateZodSchema } from '@src/utils/validateZodSchema';

const detailsStepSchema = z.object({
  title: z.string({ required_error: 'Title is required.' }).min(1, 'Title is required.'),

  artist: z.string().optional(),

  description: z
    .string({ required_error: 'Description is required.' })
    .min(1, 'Description is required.'),

  altText: z
    .string({ required_error: 'Alt text is required.' })
    .min(1, 'Alt text is required.')
    .max(128, 'Alt text can not be longer than 128 characters.'),

  createdAt: z.date(),
  isCreatedAtUnknown: z.boolean(),

  acquiredAt: z.date({ required_error: 'Acquisition date is required.' }),
});

type DetailsStepSchema = z.infer<typeof detailsStepSchema>;

interface DetailsStepProps {
  state: CreateUpdateArtworkState<'details'>;
  onBack(): void;
  onSubmit(data: ConfirmDetailsEvent): void;
}

export const DetailsStep = ({ state, onBack, onSubmit }: DetailsStepProps) => {
  const initialValues: DetailsStepSchema = {
    title: state.context.details?.title ?? '',
    artist: state.context.details?.artist ?? '',
    description: state.context.details?.description ?? '',
    altText: state.context.details?.altText ?? '',
    createdAt: state.context.details?.createdAt ?? new Date(),
    isCreatedAtUnknown:
      (state.context.details && typeof state.context.details.createdAt === 'undefined') ?? false,
    acquiredAt: state.context.details?.acquiredAt ?? new Date(),
  };

  const initialErrors = validateZodSchema(detailsStepSchema, 'sync')(initialValues);

  return (
    <Formik<DetailsStepSchema>
      initialValues={initialValues}
      initialErrors={initialErrors}
      validate={validateZodSchema(detailsStepSchema)}
      onSubmit={values => {
        onSubmit({
          type: 'CONFIRM_DETAILS',
          details: {
            title: values.title,
            description: values.description,
            artist: values.artist,
            altText: values.altText,
            createdAt: values.isCreatedAtUnknown ? undefined : values.createdAt,
            acquiredAt: values.acquiredAt,
          },
        });
      }}>
      {formik => {
        const { values, isSubmitting, isValid } = formik;

        return (
          <Form className={styles.form}>
            <div className={styles.activeContent}>
              <img src={state.context.selection.preview.src} alt="" />
            </div>

            <label htmlFor="title">Title</label>
            <Field id="title" name="title" required />

            <label htmlFor="artist">Artist</label>
            <Field id="artist" name="artist" />

            <label htmlFor="description">Description</label>
            <Field as="textarea" id="description" name="description" required />

            <label htmlFor="altText">Alt Text</label>
            <Field as="textarea" id="altText" name="altText" required />

            <label htmlFor="createdAt">Created</label>
            {!values.isCreatedAtUnknown ? (
              <Field
                id="createdAt"
                name="createdAt"
                type="date"
                value={dayjs(values.createdAt).format('YYYY-MM-DD')}
              />
            ) : (
              <input id="createdAt" name="createdAt-fake" value="Unknown" disabled />
            )}

            <Field id="isCreatedAtUnknown" name="isCreatedAtUnknown" type="checkbox" />
            <label htmlFor="isCreatedAtUnknown">Check if created date is unknown</label>

            <label htmlFor="acquiredAt">Acquired</label>
            <Field
              id="acquiredAt"
              name="acquiredAt"
              type="date"
              value={dayjs(values.acquiredAt).format('YYYY-MM-DD')}
            />

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
