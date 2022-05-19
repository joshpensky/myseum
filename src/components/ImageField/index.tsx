import { DragEvent, Fragment, ReactNode, useState } from 'react';
import { MeasureUnit } from '@prisma/client';
import cx from 'classnames';
import { z } from 'zod';
import Button from '@src/components/Button';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import { convertUnit } from '@src/utils/convertUnit';
import styles from './imageField.module.scss';

export const imageFieldSchema = z.object({
  image: (typeof window === 'undefined'
    ? z.any()
    : z.instanceof(HTMLImageElement, { message: 'Must upload an image.' })) as z.ZodType<
    HTMLImageElement,
    z.ZodTypeDef,
    HTMLImageElement
  >,

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

type ImageFieldSchema = z.infer<typeof imageFieldSchema>;

export interface ImageFieldProps {
  value: HTMLImageElement | null;
  onChange(data: ImageFieldSchema | null): void;
  preview?(image: HTMLImageElement): ReactNode;
}

export const ImageField = ({ value, onChange, preview }: ImageFieldProps) => {
  const accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const [isUploading, setIsUploading] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  /**
   * Resizes the image to a workable size and formats to JPEG.
   *
   * @param img The image to resize
   * @returns the resized image
   */
  const resizeImage = async (img: HTMLImageElement): Promise<HTMLImageElement> => {
    const imageDimensions = CommonUtils.getImageDimensions(img);
    // If image is small, return original image!
    if (imageDimensions.width <= 1000 && imageDimensions.height <= 1000) {
      return img;
    }

    // Otherwise resize to smaller size and quality
    URL.revokeObjectURL(img.src);
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
      const imageDimensions = CommonUtils.getImageDimensions(resizedImage);
      const unit = convertUnit(1, 'px', 'in');

      onChange({
        image: resizedImage,
        width: Math.round(imageDimensions.width * unit * 100) / 100,
        height: Math.round(imageDimensions.height * unit * 100) / 100,
        unit: 'in',
      });
      setIsUploading(false);
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
    <div className={styles.field} data-dropping={isDropping}>
      {!value ? (
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
          {preview?.(value) ?? <img src={value.src} alt="Preview of the uploaded artwork." />}
        </div>
      )}

      {!!value && (
        <Button
          className={styles.reset}
          type="reset"
          onClick={evt => {
            evt.preventDefault();
            onChange(null);
          }}>
          Change
        </Button>
      )}
    </div>
  );
};
