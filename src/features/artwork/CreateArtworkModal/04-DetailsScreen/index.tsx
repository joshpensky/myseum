import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import {
  ConfirmDetailsEvent,
  CreateArtworkState,
} from '@src/features/artwork/CreateArtworkModal/state';
import { DetailsFields, detailsFieldsSchema } from '@src/features/artwork/DetailsFields';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './detailsScreen.module.scss';

const detailsScreenSchema = z.object({}).merge(detailsFieldsSchema);

type DetailsScreenSchema = z.infer<typeof detailsScreenSchema>;

interface DetailsScreenProps {
  state: CreateArtworkState<'details'>;
  onBack(): void;
  onSubmit(data: ConfirmDetailsEvent): void;
}

export const DetailsScreen = ({ state, onBack, onSubmit }: DetailsScreenProps) => {
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
          const { isSubmitting, isValid } = formik;

          return (
            <Form className={styles.form} noValidate>
              <FormModal.Sidecar>
                <div className={styles.preview}>
                  <img src={state.context.selection.preview} alt="" />
                </div>
              </FormModal.Sidecar>

              <div className={styles.formBody}>
                <DetailsFields />
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
