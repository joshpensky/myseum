import { useRef, useState } from 'react';
import tw from 'twin.macro';
import { GalleryColor } from '@prisma/client';
import dayjs from 'dayjs';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
  OnDragStartResponder,
} from 'react-beautiful-dnd';
import { GalleryArtworkDto, GalleryDto } from '@src/data/GallerySerializer';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Position } from '@src/types';
import EditGalleryBlock from './EditGalleryBlock';
import Entrance from './Entrance';
import GalleryBlock, { GalleryBlockProps } from './GalleryBlock';
import Button from '../Button';

export interface CreateUpdateGalleryDto {
  id?: number;
  name: string;
  color: GalleryColor;
  height: number;
  position: Position;
  createdAt: string | Date;
  updatedAt: string | Date;
  museumId: number;
  artworks: GalleryArtworkDto[];
}

type MuseumMapProps = {
  disabled?: boolean;
  galleries: CreateUpdateGalleryDto[];
  onGalleryCreate(position: Position): void;
  onGalleryUpdate(position: Position, gallery: CreateUpdateGalleryDto): void;
  onGalleryDelete(position: Position): void;
  isEditing?: boolean;
};

const MuseumMap = ({
  disabled,
  galleries,
  isEditing,
  onGalleryCreate,
  onGalleryUpdate,
  onGalleryDelete,
}: MuseumMapProps) => {
  const [droppableSourceId, setDroppableSourceId] = useState<string | null>(null);

  let minX = 0;
  let maxX = 0;
  let maxY = 0;

  const galleryMap = new Map<number, Map<number, CreateUpdateGalleryDto>>();

  // A map of coordinates to galleries
  // { [xPos]: { [yPos]: Gallery } }
  galleries.forEach(gallery => {
    // Update the min and max X/Y coords for grid positioning
    minX = Math.min(minX, gallery.position.x);
    maxX = Math.max(maxX, gallery.position.x);
    maxY = Math.max(maxY, gallery.position.y);

    // Add the gallery to the map
    const galleryMapForX =
      galleryMap.get(gallery.position.x) ?? new Map<number, GalleryBlockProps['gallery']>();
    galleryMapForX.set(gallery.position.y, gallery);
    galleryMap.set(gallery.position.x, galleryMapForX);
  });

  const isGalleryAdjacentToPosition = (xPosition: number, yPosition: number) => {
    const isGalleryAbove =
      galleryMap.get(xPosition)?.get(yPosition - 1) &&
      droppableSourceId !== `${xPosition}:${yPosition - 1}`;
    const isGalleryBelow =
      galleryMap.get(xPosition)?.get(yPosition + 1) &&
      droppableSourceId !== `${xPosition}:${yPosition + 1}`;
    const isGalleryLeft =
      galleryMap.get(xPosition - 1)?.get(yPosition) &&
      droppableSourceId !== `${xPosition - 1}:${yPosition}`;
    const isGalleryRight =
      galleryMap.get(xPosition + 1)?.get(yPosition) &&
      droppableSourceId !== `${xPosition + 1}:${yPosition}`;

    return isGalleryAbove || isGalleryBelow || isGalleryLeft || isGalleryRight;
  };

  const onDragStart: OnDragStartResponder = initial => {
    setDroppableSourceId(initial.source.droppableId);
  };

  const onDragEnd: OnDragEndResponder = result => {
    try {
      if (!result.destination) {
        return;
      }

      const [srcXPosition, srcYPosition] = result.source.droppableId
        .split(':')
        .map(str => Number.parseInt(str));

      const [dstXPosition, dstYPosition] = result.destination.droppableId
        .split(':')
        .map(str => Number.parseInt(str));

      const gallery = galleries.find(
        gallery => gallery.position.x === srcXPosition && gallery.position.y === srcYPosition,
      );

      if (gallery) {
        onGalleryUpdate(
          { x: srcXPosition, y: srcYPosition },
          {
            ...gallery,
            position: {
              x: dstXPosition,
              y: dstYPosition,
            },
          },
        );
      }
    } finally {
      setDroppableSourceId(null);
    }
  };

  // Grid width = longest side from the center * 2, plus 1 (to account for x=0 column)
  let gridWidth = Math.max(Math.abs(maxX), Math.abs(minX)) * 2 + 1;
  // Grid height = max y + 1 (y will ALWAYS be greater than 0)
  let gridHeight = maxY + 1;

  if (isEditing) {
    gridWidth += 2;
    gridHeight += 1;
  }

  // Get the starting X position (where center x=0)
  const startingX = (gridWidth - 1) / -2;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Automatically center the scroll area on mount and when entering/exiting edit mode
  useIsomorphicLayoutEffect(() => {
    if (scrollAreaRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        (scrollAreaRef.current.clientWidth - scrollContainerRef.current.clientWidth) / 2;
    }
  }, [isEditing]);

  return (
    <div css={[tw`relative flex-1 w-full`]}>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div ref={scrollContainerRef} css={tw`absolute inset-0 flex overflow-auto`}>
          <div ref={scrollAreaRef} css={[tw`p-6 flex flex-col mx-auto`]}>
            <Entrance />
            <div css={tw`flex flex-col mt-2.5`}>
              {Array(gridHeight)
                .fill(null)
                .map((_, yPosition) => (
                  <div key={yPosition} css={tw`flex`}>
                    {Array(gridWidth)
                      .fill(null)
                      .map((_, xIndex) => {
                        const xPosition = startingX + xIndex;
                        const droppableId = `${xPosition}:${yPosition}`;

                        const galleryMapForX = galleryMap.get(xPosition);
                        const gallery = galleryMapForX?.get(yPosition);

                        // If no gallery for position, render empty block
                        if (!gallery) {
                          const isDroppable = isGalleryAdjacentToPosition(xPosition, yPosition);

                          const isInvalid = xPosition === 0 && yPosition === 0;

                          return (
                            <div key={droppableId} css={tw`flex flex-shrink-0 m-2.5`}>
                              <div css={[tw`relative block w-96 ratio-4-3 rounded-lg bg-gray-100`]}>
                                {isEditing && (
                                  <Droppable
                                    droppableId={droppableId}
                                    isDropDisabled={disabled || !isDroppable}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        css={[
                                          tw`absolute inset-0 rounded-lg flex flex-col items-center justify-center`,
                                          isInvalid &&
                                            !(isDroppable && droppableSourceId) &&
                                            tw`bg-red-200`,
                                          isDroppable &&
                                            droppableSourceId &&
                                            (snapshot.isDraggingOver
                                              ? tw`bg-gray-200`
                                              : tw`bg-gray-200`),
                                        ]}
                                        {...provided.droppableProps}>
                                        {isInvalid && !(isDroppable && droppableSourceId) && (
                                          <p css={tw`text-red-600 text-center not-last:mb-3`}>
                                            There must be a gallery at the entrance.
                                          </p>
                                        )}

                                        {isDroppable && !droppableSourceId && (
                                          <Button
                                            onClick={() =>
                                              onGalleryCreate({ x: xPosition, y: yPosition })
                                            }>
                                            Add gallery
                                          </Button>
                                        )}

                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                )}
                              </div>
                            </div>
                          );
                        }

                        if (!isEditing && typeof gallery.id === 'number') {
                          // Safe casting
                          return <GalleryBlock key={gallery.id} gallery={gallery as GalleryDto} />;
                        }

                        // Assign gallery ID, or temporary one based on create date
                        const galleryId = gallery.id ?? dayjs(gallery.createdAt).valueOf();

                        // Gallery position is invalid if there isn't an adjacent one
                        const isInvalid = !isGalleryAdjacentToPosition(xPosition, yPosition);

                        return (
                          <div key={droppableId} css={tw`flex flex-shrink-0 m-2.5`}>
                            <div
                              css={[
                                tw`relative block w-96 ratio-4-3 rounded-lg`,
                                !droppableSourceId && isInvalid && tw`ring ring-red-600`,
                              ]}>
                              {!droppableSourceId && isInvalid && (
                                <p
                                  css={[
                                    tw`absolute py-1 px-3 bottom-0 left-1/2 rounded-full whitespace-nowrap bg-red-600 text-white text-sm z-10`,
                                    tw`transform -translate-x-1/2 translate-y-1/2`,
                                  ]}>
                                  There must be a connecting gallery.
                                </p>
                              )}
                              <Droppable
                                key={droppableId}
                                droppableId={droppableId}
                                isDropDisabled={
                                  disabled || isInvalid || droppableSourceId !== droppableId
                                }>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    css={[
                                      tw`absolute inset-0 rounded-lg`,
                                      droppableSourceId === droppableId &&
                                        (snapshot.isDraggingOver
                                          ? tw`bg-gray-200`
                                          : tw`bg-gray-200`),
                                    ]}
                                    {...provided.droppableProps}>
                                    <Draggable
                                      key={galleryId}
                                      draggableId={String(galleryId)}
                                      index={0}
                                      isDragDisabled={disabled}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          css={[tw`block w-96`]}
                                          {...provided.draggableProps}
                                          style={{ ...provided.draggableProps.style }}>
                                          <EditGalleryBlock
                                            disabled={disabled}
                                            gallery={gallery}
                                            onChange={updatedGallery => {
                                              onGalleryUpdate(
                                                { x: xPosition, y: yPosition },
                                                updatedGallery,
                                              );
                                            }}
                                            onDelete={() => {
                                              onGalleryDelete({ x: xPosition, y: yPosition });
                                            }}
                                            snapshot={snapshot}
                                            dragHandleProps={provided.dragHandleProps}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default MuseumMap;
