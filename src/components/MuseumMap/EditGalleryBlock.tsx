import tw from 'twin.macro';
import { Slot } from '@radix-ui/react-slot';
import dayjs from 'dayjs';
import { DraggableProvidedDragHandleProps, DraggableStateSnapshot } from 'react-beautiful-dnd';
import AutofitTextField from '@src/components/AutofitTextField';
import IconButton from '@src/components/IconButton';
import { CreateUpdateGalleryDto } from '@src/components/MuseumMap';
import { Popover } from '@src/components/Popover';
import Cog from '@src/svgs/Cog';
import DragHandle from '@src/svgs/DragHandle';
import Trash from '@src/svgs/Trash';
import GallerySettings from '../GallerySettings';

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

  // const settingsPopover = usePopover(`gallery-${galleryId}-settings`);

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
        <div css={[tw`p-2 flex flex-shrink-0 justify-between mb-px rounded-t-lg`, blockColor]}>
          <div css={tw`flex`}>
            <IconButton {...dragHandleProps} title="Drag" disabled={disabled}>
              <DragHandle />
            </IconButton>
          </div>

          <div css={tw`flex`}>
            <Popover.Root open={disabled ? false : undefined}>
              <Popover.Trigger as={Slot}>
                <IconButton title="Open gallery settings" disabled={disabled}>
                  <Cog />
                </IconButton>
              </Popover.Trigger>

              <Popover.Content side="bottom" align="center" aria-label="Gallery settings">
                <Popover.Header>
                  <h2>Settings</h2>
                </Popover.Header>

                <Popover.Body>
                  <GallerySettings
                    id={`gallery-${galleryId}`}
                    disabled={disabled}
                    wallColor={gallery.color}
                    onWallColorChange={color => onChange({ ...gallery, color })}
                  />
                </Popover.Body>
              </Popover.Content>
            </Popover.Root>

            <div css={tw`flex ml-1`}>
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
