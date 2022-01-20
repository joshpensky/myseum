import { Form, Formik } from 'formik';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type { CreateUpdateArtworkState } from '@src/features/create-update-artwork/state';

interface ReviewStepProps {
  state: CreateUpdateArtworkState<'review'>;
  onSubmit(): void;
}

export const ReviewStep = ({ state, onSubmit }: ReviewStepProps) => {
  const initialValues = {};

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {
        // TODO: send to API
        onSubmit();
      }}>
      {formik => {
        const { isSubmitting, isValid } = formik;

        return (
          <Form className={styles.form} noValidate>
            <div className={styles.activeContent}>
              <img src={state.context.selection.preview.src} alt="" />
            </div>

            <div className={styles.formActions}>
              <Button size="large" type="submit" filled disabled={!isValid || isSubmitting}>
                Save
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
