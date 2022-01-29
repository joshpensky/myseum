import { Fragment, useState } from 'react';
import cx from 'classnames';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { CheckboxField } from '@src/components/CheckboxField';
import { FieldWrapper } from '@src/components/FieldWrapper';
import { Preview3d } from '@src/components/Preview3d';
import { TextField } from '@src/components/TextField__New';
// import { ArtistDto } from '@src/data/ArtistSerializer';
import rootStyles from '@src/features/create-artwork/root.module.scss';
import type { ConfirmDetailsEvent, CreateArtworkState } from '@src/features/create-artwork/state';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './detailsStep.module.scss';

const detailsStepSchema = z.object({
  title: z.string({ required_error: 'Title is required.' }).min(1, 'Title is required.'),

  artist: z
    .object({
      id: z.number().optional(),
      name: z.string(),
    })
    .optional(),

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
  state: CreateArtworkState<'details'>;
  onBack(): void;
  onSubmit(data: ConfirmDetailsEvent): void;
}

export const DetailsStep = ({ state, onBack, onSubmit }: DetailsStepProps) => {
  // const [artists, setArtists] = useState<ArtistDto[] | null>(null);
  // useEffect(() => {
  //   (async () => {
  //     const res = await fetch('/api/artists');
  //     const data = await res.json();
  //     setArtists(data);
  //   })();
  // }, []);

  const initialValues: DetailsStepSchema = {
    title: state.context.details?.title ?? '',
    artist: state.context.details?.artist ?? undefined,
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

        const [rotated, setRotated] = useState(false);

        return (
          <Form className={rootStyles.form} noValidate>
            <div className={cx(rootStyles.activeContent, styles.activeContent)}>
              <div className={styles.preview}>
                <Preview3d
                  rotated={rotated}
                  artwork={{
                    src: state.context.selection.preview.src,
                    alt: 'Preview of the uploaded artwork',
                    size: {
                      width: state.context.dimensions.width,
                      height: state.context.dimensions.height,
                      depth: state.context.framing.depth ?? 0,
                    },
                  }}
                />
              </div>

              <Button type="button" onClick={() => setRotated(!rotated)}>
                Rotate
              </Button>
            </div>

            <FieldWrapper className={styles.field} name="title" label="Title" required>
              {field => <TextField {...field} type="text" />}
            </FieldWrapper>

            {/* TODO: artist autocomplete+create */}
            {/* <FieldWrapper className={styles.field} name="artist" label="Artist">
              {field => <TextField {...field} type="text" />}
            </FieldWrapper> */}

            <FieldWrapper className={styles.field} name="description" label="Description" required>
              {field => <TextField {...field} type="text" grow rows={2} />}
            </FieldWrapper>

            <FieldWrapper className={styles.field} name="altText" label="Alt Text" required>
              {field => <TextField {...field} type="text" grow rows={2} />}
            </FieldWrapper>

            <div className={styles.formRow}>
              <div className={styles.createdAtField}>
                <FieldWrapper name="createdAt" label="Created" required>
                  {field =>
                    !values.isCreatedAtUnknown ? (
                      <TextField {...field} type="date" />
                    ) : (
                      <TextField
                        {...field}
                        name="createdAt-fake"
                        type="text"
                        value="Unknown"
                        disabled
                      />
                    )
                  }
                </FieldWrapper>

                <CheckboxField
                  name="isCreatedAtUnknown"
                  label={
                    <Fragment>
                      Check if <span className="sr-only">created date is</span>&nbsp;unknown
                    </Fragment>
                  }
                />
              </div>

              <FieldWrapper name="acquiredAt" label="Acquired" required>
                {field => <TextField {...field} type="date" />}
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