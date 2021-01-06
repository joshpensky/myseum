import { DragEvent, useLayoutEffect, useState } from 'react';
import tw from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkContext';

const UploadArtwork = () => {
  const { image, setActualDimensions, setMeasurement, setImage } = useAddArtworkContext();

  // Whether drag/drop upload feature is available for the browser
  const [canDragDropUpload] = useState(() => {
    const div = document.createElement('div');
    return 'draggable' in div || ('ondragstart' in div && 'ondrop' in div);
  });

  const accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  // TODO: add support for image/heic (see heic2any)

  const [isUploading, setIsUploading] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  /**
   * Loads the image and updates image, dimension, and measurement states.
   *
   * @param src the src of the image
   */
  const loadImage = (src: string) =>
    new Promise<void>(resolve => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Converts image pixel dimensions to inches
        const getDimension = (value: number) => {
          const inches = value / 72; // px to in, at 72ppi
          return Math.round(inches * 100) / 100; // rounded to nearest 0.01
        };
        setActualDimensions({
          width: getDimension(img.naturalWidth),
          height: getDimension(img.naturalHeight),
        });
        setMeasurement('inch');
        resolve();
      };
      img.src = src;
    });

  /**
   * Handler for the input file upload. Reads the first file (if available)
   * as a data URL string and loads the image.
   */
  const onFileUpload = (files: FileList | null) => {
    setIsUploading(true);
    const imageFile = files?.item(0);
    if (!imageFile || !accept.includes(imageFile.type)) {
      setIsUploading(false);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        await loadImage(reader.result);
      } else {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(imageFile);
  };

  /**
   * Handler for when the user enters the drop area. Turns on
   * dropping indicator state.
   */

  const onDropEnter = (evt: DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    setIsDropping(true);
  };

  /**
   * Handler for when the user leaves the drop area. Turns off
   * dropping indicator state.
   */
  const onDropLeave = (evt: DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    setIsDropping(false);
  };

  /**
   * Handler for when the user drops an image in the drop area.
   * This will start the file upload process.
   */
  const onDrop = (evt: DragEvent<HTMLLabelElement>) => {
    evt.preventDefault();
    setIsDropping(false);
    onFileUpload(evt.dataTransfer.files);
  };

  // _DEV_ TODO: remove
  // Loads an image immediately
  useLayoutEffect(() => {
    if (!image) {
      loadImage('/img/test-add.jpeg');
    }
  }, [image]);

  return (
    <div
      css={[
        tw`absolute inset-0 size-full transition-colors px-6 py-5`,
        !image && tw`focus-within:(bg-white bg-opacity-10)`,
        isDropping && tw`bg-white bg-opacity-10`,
      ]}
      onDragOver={onDropEnter}
      onDragEnter={onDropEnter}
      onDragLeave={onDropLeave}
      onDragEnd={onDropLeave}>
      <div css={tw`sr-only`}>
        <label htmlFor="artworkUpload">Upload artwork</label>
        <input
          id="artworkUpload"
          type="file"
          accept={accept.join(', ')}
          onChange={evt => onFileUpload(evt.target.files)}
        />
      </div>

      <label
        css={[
          tw`absolute inset-0 flex flex-col flex-1 items-center justify-center size-full text-center p-6`,
          !image && tw`cursor-pointer`,
        ]}
        htmlFor="artworkUpload"
        onDrop={onDrop}>
        <span>
          {isUploading ? (
            <span>Uploading...</span>
          ) : isDropping ? (
            <span>Release to upload</span>
          ) : (
            <span>
              {canDragDropUpload ? 'Drag and drop anywhere to upload' : 'Click anywhere to upload'}
            </span>
          )}
        </span>
      </label>
    </div>
  );
};

export default UploadArtwork;
