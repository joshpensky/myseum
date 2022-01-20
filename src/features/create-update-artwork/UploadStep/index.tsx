import { ChangeEvent, useState } from 'react';
import { MeasureUnit } from '@prisma/client';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmUploadEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import { CommonUtils } from '@src/utils/CommonUtils';
import { validateZodSchema } from '@src/utils/validateZodSchema';

const uploadStepSchema = z.object({
  image: z.instanceof(HTMLImageElement, { message: 'Must upload an image.' }),

  width: z
    .number({ required_error: 'Width is required.' })
    .positive('Width must be greater than 0.'),

  height: z
    .number({ required_error: 'Height is required.' })
    .positive('Height must be greater than 0.'),

  unit: z.nativeEnum(MeasureUnit, {
    invalid_type_error: 'Invalid unit.',
    required_error: 'Unit is required.',
  }),
});

type UploadStepSchema = z.infer<typeof uploadStepSchema>;

interface UploadStepProps {
  state: CreateUpdateArtworkState<'upload'>;
  onSubmit(data: ConfirmUploadEvent): void;
}

export const UploadStep = ({ state, onSubmit }: UploadStepProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const initialValues: UploadStepSchema = {
    image: state.context.upload?.image ?? (undefined as any),
    width: state.context.dimensions?.width ?? 0,
    height: state.context.dimensions?.height ?? 0,
    unit: state.context.dimensions?.unit ?? 'in',
  };

  const initialErrors = validateZodSchema(uploadStepSchema, 'sync')(initialValues);

  return (
    <Formik<UploadStepSchema>
      initialValues={initialValues}
      initialErrors={initialErrors}
      validate={validateZodSchema(uploadStepSchema)}
      onSubmit={values => {
        onSubmit({
          type: 'CONFIRM_UPLOAD',
          upload: {
            image: values.image,
          },
          dimensions: {
            width: values.width,
            height: values.height,
            unit: values.unit,
          },
        });
      }}>
      {formik => {
        const { isSubmitting, isValid, setFieldValue, values } = formik;

        const loadImage = (src: string) => {
          const img = new Image();
          img.onload = () => {
            setFieldValue('image', img);
            setIsUploading(false);

            // Converts image pixel dimensions to inches
            const getDimension = (value: number) => {
              const inches = value / 72; // px to in, at 72ppi
              return Math.round(inches * 100) / 100; // rounded to nearest 0.01
            };
            const imageDimensions = CommonUtils.getImageDimensions(img);
            setFieldValue('width', getDimension(imageDimensions.width));
            setFieldValue('height', getDimension(imageDimensions.height));
            setFieldValue('unit', 'in');
          };
          img.src = src;
        };

        const onFileUpload = (evt: ChangeEvent<HTMLInputElement>) => {
          setIsUploading(true);
          const imageFile = evt.target.files?.item(0);
          if (!imageFile || !accept.includes(imageFile.type)) {
            setIsUploading(false);
            return;
          }
          const reader = new FileReader();
          reader.addEventListener(
            'load',
            () => {
              if (typeof reader.result === 'string') {
                loadImage(reader.result);
              } else {
                setIsUploading(false);
              }
            },
            { once: true },
          );
          reader.readAsDataURL(imageFile);
        };

        return (
          <Form className={styles.form}>
            <div className={styles.activeContent}>
              {!values.image ? (
                <input
                  id="file"
                  type="file"
                  accept={accept.join(', ')}
                  disabled={isUploading}
                  required
                  onChange={evt => onFileUpload(evt)}
                />
              ) : (
                <img src={values.image.src} alt="" />
              )}
            </div>

            {values.image && (
              <Button size="large" type="reset" onClick={() => setFieldValue('image', undefined)}>
                Reset
              </Button>
            )}

            <div className={styles.formActions}>
              <Button
                size="large"
                type="submit"
                filled
                disabled={isUploading || !isValid || isSubmitting}>
                Next
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
