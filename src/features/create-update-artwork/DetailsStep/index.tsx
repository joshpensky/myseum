import { Field, Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { TextField } from '@src/components/TextField__New';
import rootStyles from '@src/features/create-update-artwork/root.module.scss';
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
          <Form className={rootStyles.form} noValidate>
            <div className={rootStyles.activeContent}>
              <img src={state.context.selection.preview.src} alt="" />
            </div>

            <label htmlFor="title">Title</label>
            <TextField id="title" name="title" type="text" required />

            <label htmlFor="artist">Artist</label>
            <TextField id="artist" name="artist" type="text" />

            <label htmlFor="description">Description</label>
            <TextField id="description" name="description" type="text" grow rows={2} required />

            <label htmlFor="altText">Alt Text</label>
            <TextField id="altText" name="altText" type="text" grow rows={2} required />

            <label htmlFor="createdAt">Created</label>
            {!values.isCreatedAtUnknown ? (
              <TextField id="createdAt" name="createdAt" type="date" />
            ) : (
              <TextField
                id="createdAt"
                name="createdAt-fake"
                type="text"
                value="Unknown"
                disabled
              />
            )}

            <Field id="isCreatedAtUnknown" name="isCreatedAtUnknown" type="checkbox" />
            <label htmlFor="isCreatedAtUnknown">Check if created date is unknown</label>

            <label htmlFor="acquiredAt">Acquired</label>
            <TextField id="acquiredAt" name="acquiredAt" type="date" />

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
