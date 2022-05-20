import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { ConfirmDetailsEvent, CreateFrameState } from '@src/features/frame/CreateFrameModal/state';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './detailsScreen.module.scss';

const detailsScreenSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }).min(1, 'Name is required.'),

  altText: z
    .string({ required_error: 'Alt text is required.' })
    .min(1, 'Alt text is required.')
    .max(128, 'Alt text can not be longer than 128 characters.'),
});

type DetailsScreenSchema = z.infer<typeof detailsScreenSchema>;

interface DetailsScreenProps {
  state: CreateFrameState<'details'>;
  onBack(): void;
  onSubmit(data: ConfirmDetailsEvent): void;
}

export const DetailsScreen = ({ state, onBack, onSubmit }: DetailsScreenProps) => {
  const initialValues: DetailsScreenSchema = {
    name: state.context.details?.name ?? '',
    altText: state.context.details?.altText ?? '',
  };

  const initialErrors = validateZodSchema(detailsScreenSchema, 'sync')(initialValues);

  return (
    <FormModal.Screen title="Details" description="Fill in some information about the frame.">
      <Formik<DetailsScreenSchema>
        initialValues={initialValues}
        initialErrors={initialErrors}
        validate={validateZodSchema(detailsScreenSchema)}
        onSubmit={values => {
          onSubmit({
            type: 'CONFIRM_DETAILS',
            details: {
              name: values.name,
              altText: values.altText,
            },
          });
        }}>
        {formik => {
          const { isSubmitting, isValid } = formik;

          return (
            <Form className={styles.form} noValidate>
              <FormModal.Sidecar>
                <div className={styles.preview}>
                  <img src={state.context.selection.preview} alt="" />
                </div>
              </FormModal.Sidecar>

              <div className={styles.formBody}>
                <FieldWrapper className={styles.field} name="name" label="Name" required>
                  {field => <TextField {...field} type="text" />}
                </FieldWrapper>

                <FieldWrapper className={styles.field} name="altText" label="Alt Text" required>
                  {field => <TextArea {...field} rows={2} />}
                </FieldWrapper>
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
