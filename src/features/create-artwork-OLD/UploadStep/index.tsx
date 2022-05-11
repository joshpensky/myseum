import { DragEvent, Fragment, useState } from 'react';
import { MeasureUnit } from '@prisma/client';
import cx from 'classnames';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import rootStyles from '@src/features/create-artwork-OLD/root.module.scss';
import type {
  ConfirmUploadEvent,
  CreateArtworkState,
} from '@src/features/create-artwork-OLD/state';
import { CommonUtils } from '@src/utils/CommonUtils';
import { convertUnit } from '@src/utils/convertUnit';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './uploadStep.module.scss';

const uploadStepSchema = z.object({
  image:
    typeof window === 'undefined'
      ? z.any()
      : z.instanceof(HTMLImageElement, { message: 'Must upload an image.' }),

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
  state: CreateArtworkState<'upload'>;
  onSubmit(data: ConfirmUploadEvent): void;
}

export const UploadStep = ({ state, onSubmit }: UploadStepProps) => {
  const accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const [isUploading, setIsUploading] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

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
        // TODO: reset full state on image change?
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

            const imageDimensions = CommonUtils.getImageDimensions(img);
            const unit = convertUnit(1, 'px', 'in');
            setFieldValue('width', Math.round(imageDimensions.width * unit * 100) / 100);
            setFieldValue('height', Math.round(imageDimensions.height * unit * 100) / 100);
            setFieldValue('unit', 'in');
          };
          img.src = src;
        };

        const onFileUpload = (files: FileList | null) => {
          if (!files) {
            return;
          }

          setIsUploading(true);
          const imageFile = files?.item(0);
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

        /**
         * Handler for when the user enters the drop area.
         */
        const onDropStart = (evt: DragEvent<HTMLLabelElement>) => {
          evt.preventDefault();
          setIsDropping(true);
        };

        /**
         * Handler for when the user leaves the drop area.
         */
        const onDropEnd = (evt: DragEvent<HTMLLabelElement>) => {
          evt.preventDefault();
          setIsDropping(false);
        };

        /**
         * Handler for when the user drops an image in the drop area.
         */
        const onDrop = (evt: DragEvent<HTMLLabelElement>) => {
          onDropEnd(evt);
          onFileUpload(evt.dataTransfer.files);
        };

        return (
          <Form className={rootStyles.form} noValidate>
            <div className={rootStyles.activeContent}>
              {!values.image ? (
                <Fragment>
                  <input
                    className="sr-only"
                    id="file"
                    type="file"
                    accept={accept.join(', ')}
                    disabled={isUploading}
                    required
                    onChange={evt => onFileUpload(evt.target.files)}
                  />
                  <label
                    className={cx(styles.fileDrop, isDropping && styles.fileDropActive)}
                    htmlFor="file"
                    onDragOver={onDropStart}
                    onDragEnter={onDropStart}
                    onDragLeave={onDropEnd}
                    onDragEnd={onDropEnd}
                    onDrop={onDrop}>
                    Tap or drag & drop to upload
                  </label>
                </Fragment>
              ) : (
                <div className={styles.preview}>
                  <img src={values.image.src} alt="Preview of the uploaded artwork." />
                </div>
              )}
            </div>

            {!!values.image && (
              <Button
                className={styles.reset}
                type="reset"
                onClick={() => setFieldValue('image', undefined)}>
                Reset
              </Button>
            )}

            <div className={rootStyles.formActions}>
              <Button type="submit" filled busy={isSubmitting} disabled={isUploading || !isValid}>
                Next
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
