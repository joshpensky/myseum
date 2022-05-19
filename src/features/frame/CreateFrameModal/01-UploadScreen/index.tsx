import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { ImageField, imageFieldSchema } from '@src/components/ImageField';
import {
  ConfirmUploadEvent,
  CreateFrameState,
  ScreenRefValue,
} from '@src/features/frame/CreateFrameModal/state';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './uploadScreen.module.scss';

const uploadScreenSchema = z.object({}).merge(imageFieldSchema);

type UploadScreenSchema = z.infer<typeof uploadScreenSchema>;

interface UploadScreenProps {
  state: CreateFrameState<'upload'>;
  onSubmit(data: ConfirmUploadEvent): void;
}

export const UploadScreen = forwardRef<ScreenRefValue, UploadScreenProps>(function UploadStep(
  { state, onSubmit },
  ref,
) {
  const initialValues: UploadScreenSchema = {
    image: state.context.upload?.image ?? (undefined as any),
    width: state.context.dimensions?.width ?? 0,
    height: state.context.dimensions?.height ?? 0,
    unit: state.context.dimensions?.unit ?? 'in',
  };

  const initialErrors = validateZodSchema(uploadScreenSchema, 'sync')(initialValues);

  const formikRef = useRef<FormikProps<UploadScreenSchema>>(null);
  useImperativeHandle(ref, () => ({
    getIsDirty() {
      return !!formikRef.current?.values.image;
    },
  }));

  return (
    <FormModal.Screen title="Upload" description="Add a photo of the frame to get started.">
      <Formik<UploadScreenSchema>
        innerRef={formikRef}
        initialValues={initialValues}
        initialErrors={initialErrors}
        validate={validateZodSchema(uploadScreenSchema)}
        onSubmit={values => {
          onSubmit({
            type: 'CONFIRM_UPLOAD',
            upload: {
              image: values.image,
            },
            dimensions: {
              width: values.width,
              height: values.height,
              depth: 0,
              unit: values.unit,
            },
          });
        }}>
        {formik => {
          const { isSubmitting, isValid, setFieldValue, values } = formik;

          return (
            <Form className={styles.form} noValidate>
              <div className={styles.formBody}>
                <ImageField
                  value={values.image}
                  onChange={data => {
                    setFieldValue('image', data?.image);
                    setFieldValue('width', data?.width);
                    setFieldValue('height', data?.height);
                    setFieldValue('unit', data?.unit);
                  }}
                />
              </div>

              <FormModal.Footer>
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
});
