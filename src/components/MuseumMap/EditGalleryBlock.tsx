import tw from 'twin.macro';
import dayjs from 'dayjs';
import { DraggableProvidedDragHandleProps, DraggableStateSnapshot } from 'react-beautiful-dnd';
import AutofitTextField from '@src/components/AutofitTextField';
import IconButton from '@src/components/IconButton';
import { CreateUpdateGalleryDto } from '@src/components/MuseumMap';
import Close from '@src/svgs/Close';
import Cog from '@src/svgs/Cog';
import DragHandle from '@src/svgs/DragHandle';
import Trash from '@src/svgs/Trash';
import GallerySettings from '../GallerySettings';
import Popover, { usePopover } from '../Popover';

interface EditGalleryBlockProps {
  disabled?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  gallery: CreateUpdateGalleryDto;
  onChange(updatedGallery: CreateUpdateGalleryDto): void;
  onDelete(): void;
  snapshot: DraggableStateSnapshot;
}

const EditGalleryBlock = ({
  disabled,
  dragHandleProps,
  gallery,
  onChange,
  onDelete,
  snapshot,
}: EditGalleryBlockProps) => {
  const galleryId = gallery.id ?? dayjs(gallery.createdAt).valueOf();

  const settingsPopover = usePopover(`gallery-${galleryId}-settings`);

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
          tw`bg-black bg-opacity-0 ring-black ring-opacity-0 transition-all`,
          snapshot.isDragging && tw` bg-opacity-20 ring-opacity-20 shadow-popover`,
        ]}>
        <div
          css={[tw`py-3.5 px-4 flex flex-shrink-0 justify-between mb-px rounded-t-lg`, blockColor]}>
          <div css={tw`flex`}>
            <IconButton {...dragHandleProps} title="Drag" disabled={disabled}>
              <DragHandle />
            </IconButton>
          </div>

          <div css={tw`flex`}>
            <Popover
              {...settingsPopover.wrapperProps}
              css={tw`flex ml-5`}
              origin="top left"
              disabled={disabled}>
              <IconButton
                {...settingsPopover.anchorProps}
                title="Open gallery settings"
                disabled={disabled}>
                <Cog />
              </IconButton>
              <Popover.Body>
                <header
                  css={tw`py-2 px-5 bg-white rounded-t-lg mb-px flex items-center justify-between`}>
                  <h1 css={tw`font-serif leading-none text-xl mt-1 mr-3`}>Settings</h1>
                  <IconButton title="Close settings" onClick={() => settingsPopover.close(true)}>
                    <Close />
                  </IconButton>
                </header>
                <section css={tw`px-5 pt-4 pb-5 bg-white rounded-b-lg`}>
                  <GallerySettings
                    id={`gallery-${galleryId}`}
                    disabled={disabled}
                    wallColor={gallery.color}
                    onWallColorChange={color => onChange({ ...gallery, color })}
                  />
                </section>
              </Popover.Body>
            </Popover>

            <div css={tw`flex ml-5`}>
              <IconButton title="Delete" disabled={disabled} onClick={() => onDelete()}>
                <Trash />
              </IconButton>
            </div>
          </div>
        </div>

        <div
          css={[
            tw`flex flex-col flex-1 items-center justify-center text-center rounded-b-lg`,
            blockColor,
          ]}>
          <AutofitTextField
            id={`gallery-${galleryId}-name`}
            css={[tw`pb-0.5`]}
            inputCss={[tw`font-serif leading-none text-2xl`]}
            label="Gallery name"
            disabled={disabled}
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
