import { DragEvent, Fragment, forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { MeasureUnit } from '@prisma/client';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import {
  ConfirmUploadEvent,
  CreateArtworkState,
  ScreenRefValue,
} from '@src/features/artwork/CreateArtworkModal/state';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import { convertUnit } from '@src/utils/convertUnit';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './uploadScreen.module.scss';

const uploadScreenSchema = z.object({
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

type UploadScreenSchema = z.infer<typeof uploadScreenSchema>;

interface UploadScreenProps {
  state: CreateArtworkState<'upload'>;
  onSubmit(data: ConfirmUploadEvent): void;
}

export const UploadScreen = forwardRef<ScreenRefValue, UploadScreenProps>(function UploadStep(
  { state, onSubmit },
  ref,
) {
  const accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const [isUploading, setIsUploading] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

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
    <FormModal.Screen title="Upload" description="Add a photo of the artwork to get started.">
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

          /**
           * Resizes the image to a workable size and formats to JPEG.
           *
           * @param img The image to resize
           * @returns the resized image
           */
          const resizeImage = async (img: HTMLImageElement): Promise<HTMLImageElement> => {
            URL.revokeObjectURL(img.src);

            const imageDimensions = CommonUtils.getImageDimensions(img);
            const resizedDimensions = CanvasUtils.objectContain(
              { width: 1000, height: 1000 },
              imageDimensions,
            );

            const canvas = document.createElement('canvas');
            canvas.width = resizedDimensions.width;
            canvas.height = resizedDimensions.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              throw new Error('2D context not available.');
            }
            ctx.drawImage(img, 0, 0, resizedDimensions.width, resizedDimensions.height);

            const resizedImage = await new Promise<HTMLImageElement>(resolve => {
              const image = new Image();
              image.onload = () => {
                resolve(image);
              };
              image.src = canvas.toDataURL('image/jpeg', 0.7);
            });

            return resizedImage;
          };

          const loadImage = (src: string) => {
            if (isUploading) {
              return;
            }

            const img = new Image();
            img.onload = async () => {
              const resizedImage = await resizeImage(img);

              setFieldValue('image', resizedImage);
              setIsUploading(false);

              const imageDimensions = CommonUtils.getImageDimensions(resizedImage);
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
            <Form className={styles.form} noValidate>
              <div className={styles.formBody}>
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

                {!!values.image && (
                  <Button
                    className={styles.reset}
                    type="reset"
                    onClick={() => setFieldValue('image', undefined)}>
                    Reset
                  </Button>
                )}
              </div>

              <FormModal.Footer>
                <Button type="submit" filled busy={isSubmitting} disabled={isUploading || !isValid}>
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
