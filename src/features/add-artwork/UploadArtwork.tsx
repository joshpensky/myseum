import { useEffect } from 'react';
import tw from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkProvider';
import { AddArtworkStep } from './types';

const UploadArtwork: AddArtworkStep = {
  Main: function UploadArtworkMain() {
    const { image, setActualDimensions, setImage, setIsNextDisabled } = useAddArtworkContext();

    // Load the image
    // TODO: implement upload
    const loadImage = () => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const getDimension = (value: number) => {
          const inches = value / 72; // px to in, at 72ppi
          return Math.round(inches * 100) / 100; // rounded to nearest 0.01
        };
        setActualDimensions({
          width: getDimension(img.naturalWidth),
          height: getDimension(img.naturalHeight),
        });
      };
      img.src = '/img/test-add.jpeg';
    };

    useEffect(() => {
      setIsNextDisabled(!image);
    }, [image]);

    return (
      <div
        css={[
          tw`flex flex-col flex-1 size-full items-center justify-center`,
          tw`ring-0 ring-inset ring-white transition-shadow focus-within:ring-1`,
        ]}>
        <input type="file" css={tw`absolute inset-0 size-full sr-only`} />
        <label htmlFor="artworkUpload" css={tw`text-center`}>
          Drag and drop anywhere to upload
        </label>
      </div>
    );
  },
  Rail: function UploadArtworkRail() {
    return <p>Upload an image of the artwork.</p>;
  },
};

export default UploadArtwork;
