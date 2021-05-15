import tw from 'twin.macro';
import { Gallery } from '@prisma/client';
import dayjs from 'dayjs';
import { DraggableProvidedDragHandleProps, DraggableStateSnapshot } from 'react-beautiful-dnd';
import AutofitTextField from '@src/components/AutofitTextField';
import IconButton from '@src/components/IconButton';
import Cog from '@src/svgs/Cog';
import DragHandle from '@src/svgs/DragHandle';

interface EditGalleryBlockProps {
  dragHandleProps?: DraggableProvidedDragHandleProps;
  gallery: Gallery;
  onChange(updatedGallery: Gallery): void;
  snapshot: DraggableStateSnapshot;
}

const EditGalleryBlock = ({
  dragHandleProps,
  gallery,
  onChange,
  snapshot,
}: EditGalleryBlockProps) => {
  const blockColor = {
    mint: tw`bg-mint-200`,
    pink: tw`bg-pink-200`,
    navy: tw`bg-navy-200 text-white`,
    paper: tw`bg-paper-200`,
  }[gallery.color];

  return (
    <div css={[tw`relative w-full ratio-4-3`]}>
      <div
        css={[
          tw`absolute inset-0 flex flex-col rounded-lg`,
          snapshot.isDragging &&
            tw`bg-black bg-opacity-20 ring-black ring-opacity-20 shadow-popover`,
        ]}>
        <div css={[tw`py-3.5 px-3.5 flex flex-shrink-0 mb-px rounded-t-lg`, blockColor]}>
          <div css={tw`flex mr-5`}>
            <IconButton title="Drag" {...dragHandleProps}>
              <DragHandle />
            </IconButton>
          </div>
          <div css={tw`flex mr-5`}>
            <IconButton
              title="Change Color"
              onClick={() =>
                onChange({ ...gallery, color: gallery.color === 'mint' ? 'navy' : 'mint' })
              }>
              <Cog />
            </IconButton>
          </div>
        </div>
        <div
          css={[
            tw`flex flex-col flex-1 items-center justify-center text-center rounded-b-lg`,
            blockColor,
          ]}>
          <AutofitTextField
            id={`gallery-${gallery.id}-name`}
            css={[tw`pb-0.5`]}
            inputCss={[tw`font-serif leading-none text-2xl`]}
            label="Gallery name"
            value={gallery.name}
            onChange={value => onChange({ ...gallery, name: value })}
          />
          <p css={tw`text-sm`}>Est. {dayjs(gallery.createdAt).year()}</p>
        </div>
      </div>
    </div>
  );
};

export default EditGalleryBlock;
