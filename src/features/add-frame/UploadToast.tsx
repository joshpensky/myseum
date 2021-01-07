import Button from '@src/components/Button';
import IconButton from '@src/components/IconButton';
import Close from '@src/svgs/Close';
import tw from 'twin.macro';
import { useAddFrameContext } from './AddFrameContext';

type UploadToastProps = {
  hidden?: boolean;
  image: HTMLImageElement;
  onClose(): void;
};

const UploadToast = ({ hidden, image, onClose }: UploadToastProps) => {
  const { setImage, setActualDimensions, setMeasurement } = useAddFrameContext();

  return (
    <div
      id="upload-toast"
      css={[
        tw`absolute bottom-5 left-1/2 transform -translate-x-1/2 transition-all`,
        tw`flex items-center bg-white bg-opacity-20 pl-3 pr-6 py-2.5 rounded-full`,
        tw`focus-within:(ring-2 ring-white ring-opacity-50)`,
        hidden && tw`opacity-0 invisible`,
      ]}
      role="dialog"
      aria-modal="true"
      aria-hidden={hidden}
      aria-label="Reuse uploaded artwork photo"
      aria-describedby="upload-toast-description">
      <img
        css={tw`size-12 rounded-full object-cover mr-4`}
        src={image.src}
        alt=""
        aria-hidden="true"
      />
      <p id="upload-toast-description" css={tw`mr-4`}>
        Reuse the same upload for the frame?
      </p>
      <Button
        css={tw`mr-5`}
        onClick={() => {
          setImage(image);
          setActualDimensions({
            width: Math.round((image.naturalWidth / 72) * 100) / 100,
            height: Math.round((image.naturalHeight / 72) * 100) / 100,
          });
          setMeasurement('inch');
        }}>
        Use photo
      </Button>
      <IconButton title="Dismiss" onClick={onClose}>
        <Close />
      </IconButton>
    </div>
  );
};

export default UploadToast;
