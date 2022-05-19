import { Fragment } from 'react';
import { useFormikContext } from 'formik';
import { z } from 'zod';
import { CheckboxField } from '@src/components/CheckboxField';
import { FieldWrapper } from '@src/components/FieldWrapper';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import styles from './detailsFields.module.scss';

export const detailsFieldsSchema = z.object({
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

type DetailsFieldsSchema = z.infer<typeof detailsFieldsSchema>;

export const DetailsFields = () => {
  // const [artists, setArtists] = useState<ArtistDto[] | null>(null);
  // useEffect(() => {
  //   (async () => {
  //     const res = await fetch('/api/artists');
  //     const data = await res.json();
  //     setArtists(data);
  //   })();
  // }, []);

  const { values } = useFormikContext<DetailsFieldsSchema>();

  return (
    <Fragment>
      <FieldWrapper className={styles.field} name="title" label="Title" required>
        {field => <TextField {...field} type="text" />}
      </FieldWrapper>

      {/* TODO: artist autocomplete+create */}
      {/* <FieldWrapper className={styles.field} name="artist" label="Artist">
              {field => <TextField {...field} type="text" />}
            </FieldWrapper> */}

      <FieldWrapper className={styles.field} name="description" label="Description" required>
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
                <TextField {...field} name="createdAt-fake" type="text" value="Unknown" disabled />
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
    </Fragment>
  );
};
