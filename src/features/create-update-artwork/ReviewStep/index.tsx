import { useState } from 'react';
import cx from 'classnames';
import { Form, Formik } from 'formik';
import Button from '@src/components/Button';
import { Preview3d } from '@src/components/Preview3d';
import rootStyles from '@src/features/create-update-artwork/root.module.scss';
import type { CreateUpdateArtworkState } from '@src/features/create-update-artwork/state';
import styles from './reviewStep.module.scss';

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

            <div className={rootStyles.formActions}>
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
