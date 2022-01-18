import { ChangeEvent, FormEvent, useState } from 'react';
import Button from '@src/components/Button';
import styles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmUploadEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import { Measurement } from '@src/types';
import { CommonUtils } from '@src/utils/CommonUtils';

interface UploadStepProps {
  state: CreateUpdateArtworkState<'upload'>;
  onSubmit(data: ConfirmUploadEvent): void;
}

export const UploadStep = ({ state, onSubmit }: UploadStepProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const [image, setImage] = useState<HTMLImageElement | null>(state.context.upload?.image ?? null);
  const [width, setWidth] = useState(state.context.dimensions?.width ?? 0);
  const [height, setHeight] = useState(state.context.dimensions?.height ?? 0);
  const [unit, setUnit] = useState<Measurement>(state.context.dimensions?.unit ?? 'inch');

  const onFormSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (!image) {
      return; // TODO: form error
    }

    onSubmit({
      type: 'CONFIRM_UPLOAD',
      upload: {
        image,
      },
      dimensions: {
        width,
        height,
        unit,
      },
    });
  };

  const accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const loadImage = (src: string) => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setIsUploading(false);

      // Converts image pixel dimensions to inches
      const getDimension = (value: number) => {
        const inches = value / 72; // px to in, at 72ppi
        return Math.round(inches * 100) / 100; // rounded to nearest 0.01
      };
      const imageDimensions = CommonUtils.getImageDimensions(img);
      setWidth(getDimension(imageDimensions.width));
      setHeight(getDimension(imageDimensions.height));
      setUnit('inch');
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
    <div className={styles.content}>
      <h3 className={styles.contentTitle}>Upload</h3>
      <p className={styles.contentDescription}>Add a photo of the artwork to get started.</p>

      <form className={styles.form} onSubmit={onFormSubmit}>
        <div className={styles.activeContent}>
          {!image ? (
            <input
              id="file"
              type="file"
              accept={accept.join(', ')}
              disabled={isUploading}
              required
              onChange={evt => onFileUpload(evt)}
            />
          ) : (
            <img src={image.src} alt="" />
          )}
        </div>

        {image && (
          <Button size="large" type="reset" onClick={() => setImage(null)}>
            Reset
          </Button>
        )}

        <div className={styles.formActions}>
          <Button size="large" type="submit" filled disabled={!image || isUploading}>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};
