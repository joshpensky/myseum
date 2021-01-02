import tw from 'twin.macro';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { useAddArtworkContext } from './AddArtworkContext';
import { AddArtworkStep } from './types';

const ResizeArtwork: AddArtworkStep = {
  Main: function ResizeArtworkMain() {
    const { actualDimensions, editor, image } = useAddArtworkContext();

    return (
      <div css={tw`flex flex-col flex-1 size-full`}>
        {image && (
          <ImageSelectionEditor editor={editor} actualDimensions={actualDimensions} image={image} />
        )}
      </div>
    );
  },
  Rail: function ResizeArtworkRail() {
    const { actualDimensions, editor, image } = useAddArtworkContext();

    return (
      <div css={tw`flex flex-col flex-1`}>
        <p>Drag the handles to match the size of the artwork.</p>
        <div css={tw`flex flex-col flex-1 justify-end mt-6`}>
          <p css={tw`text-sm mb-2`}>Preview</p>
          <div css={tw`w-full h-96 bg-white bg-opacity-10 rounded-md p-4`}>
            {image && (
              <ImageSelectionPreview
                editor={editor}
                actualDimensions={actualDimensions}
                image={image}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
};

export default ResizeArtwork;
