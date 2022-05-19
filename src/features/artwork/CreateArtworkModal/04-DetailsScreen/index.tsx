import { Fragment } from 'react';
import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { CheckboxField } from '@src/components/CheckboxField';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import {
  ConfirmDetailsEvent,
  CreateArtworkState,
} from '@src/features/artwork/CreateArtworkModal/state';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './detailsScreen.module.scss';

const detailsScreenSchema = z.object({
  title: z.string({ required_error: 'Title is required.' }).min(1, 'Title is required.'),

  artist: z
    .object({
      id: z.string().optional(),
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

  createdAt: z.string().min(10, 'Invalid date.'),
  isCreatedAtUnknown: z.boolean(),

  acquiredAt: z.string().min(10, 'Acquisition date is required.'),
});

type DetailsScreenSchema = z.infer<typeof detailsScreenSchema>;

interface DetailsScreenProps {
  state: CreateArtworkState<'details'>;
  onBack(): void;
  onSubmit(data: ConfirmDetailsEvent): void;
}

export const DetailsScreen = ({ state, onBack, onSubmit }: DetailsScreenProps) => {
  // const [artists, setArtists] = useState<ArtistDto[] | null>(null);
  // useEffect(() => {
  //   (async () => {
  //     const res = await fetch('/api/artists');
  //     const data = await res.json();
  //     setArtists(data);
  //   })();
  // }, []);

  const initialValues: DetailsScreenSchema = {
    title: state.context.details?.title ?? '',
    artist: state.context.details?.artist ?? undefined,
    description: state.context.details?.description ?? '',
    altText: state.context.details?.altText ?? '',
    createdAt: dayjs(state.context.details?.createdAt ?? new Date()).format('YYYY-MM-DD'),
    isCreatedAtUnknown:
      (state.context.details && typeof state.context.details.createdAt === 'undefined') ?? false,
    acquiredAt: dayjs(state.context.details?.acquiredAt ?? new Date()).format('YYYY-MM-DD'),
  };

  const initialErrors = validateZodSchema(detailsScreenSchema, 'sync')(initialValues);

  return (
    <FormModal.Screen title="Details" description="Fill in some information about the artwork.">
      <Formik<DetailsScreenSchema>
        initialValues={initialValues}
        initialErrors={initialErrors}
        validate={validateZodSchema(detailsScreenSchema)}
        onSubmit={(values, helpers) => {
          // Check date is valid
          if (!values.isCreatedAtUnknown && !dayjs(values.createdAt).isValid()) {
            helpers.setFieldError('createdAt', 'Invalid date.');
            helpers.setSubmitting(false);
            return;
          }

          onSubmit({
            type: 'CONFIRM_DETAILS',
            details: {
              title: values.title,
              description: values.description,
              artist: values.artist,
              altText: values.altText,
              createdAt: values.isCreatedAtUnknown ? undefined : new Date(values.createdAt),
              acquiredAt: new Date(values.acquiredAt),
            },
          });
        }}>
        {formik => {
          const { values, isSubmitting, isValid } = formik;

          return (
            <Form className={styles.form} noValidate>
              <FormModal.Sidecar>
                <div className={styles.preview}>
                  <img src={state.context.selection.preview} alt="" />
                </div>
              </FormModal.Sidecar>

              <div className={styles.formBody}>
                <FieldWrapper className={styles.field} name="title" label="Title" required>
                  {field => <TextField {...field} type="text" />}
                </FieldWrapper>

                {/* TODO: artist autocomplete+create */}
                {/* <FieldWrapper className={styles.field} name="artist" label="Artist">
              {field => <TextField {...field} type="text" />}
            </FieldWrapper> */}

                <FieldWrapper
                  className={styles.field}
                  name="description"
                  label="Description"
                  required>
                  {field => <TextArea {...field} rows={2} />}
                </FieldWrapper>

                <FieldWrapper className={styles.field} name="altText" label="Alt Text" required>
                  {field => <TextArea {...field} rows={2} />}
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
              </div>

              <FormModal.Footer>
                <Button type="button" onClick={onBack}>
                  Back
                </Button>

                <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                  Next
                </Button>
              </FormModal.Footer>
            </Form>
          );
        }}
      </Formik>
    </FormModal.Screen>
  );
};
