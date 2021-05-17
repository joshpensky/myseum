import { Dispatch, SetStateAction, useRef, useState } from 'react';
import tw from 'twin.macro';
import { Gallery, GalleryColor } from '@prisma/client';
import dayjs from 'dayjs';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
  OnDragStartResponder,
} from 'react-beautiful-dnd';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import EditGalleryBlock from './EditGalleryBlock';
import Entrance from './Entrance';
import GalleryBlock from './GalleryBlock';
import Button from '../Button';

export interface CreateUpdateGalleryDto {
  id?: number;
  name: string;
  color: GalleryColor;
  height: number;
  xPosition: number;
  yPosition: number;
  createdAt: string | Date;
}

type MuseumMapProps = {
  disabled?: boolean;
  galleries: Gallery[];
  editMode?: {
    galleries: CreateUpdateGalleryDto[];
    setGalleries: Dispatch<SetStateAction<CreateUpdateGalleryDto[]>>;
  };
};

const MuseumMap = ({ disabled, galleries, editMode }: MuseumMapProps) => {
  const [droppableSourceId, setDroppableSourceId] = useState<string | null>(null);

  let minX = 0;
  let maxX = 0;
  let maxY = 0;

  const galleryMap = new Map<number, Map<number, Gallery | CreateUpdateGalleryDto>>();

  // A map of coordinates to galleries
  // { [xPos]: { [yPos]: Gallery } }
  (editMode?.galleries ?? galleries).forEach(gallery => {
    const { xPosition, yPosition } = gallery;
    // Update the min and max X/Y coords for grid positioning
    minX = Math.min(minX, xPosition);
    maxX = Math.max(maxX, xPosition);
    maxY = Math.max(maxY, yPosition);

    // Add the gallery to the map
    const galleryMapForX = galleryMap.get(xPosition) ?? new Map<number, Gallery>();
    galleryMapForX.set(yPosition, gallery);
    galleryMap.set(xPosition, galleryMapForX);
  });

  /**
   * Type check to ensure the gallery is strictly a gallery, and not a form DTO.
   */
  const isStrictGallery = (
    untypedGallery: Gallery | CreateUpdateGalleryDto,
  ): untypedGallery is Gallery => !editMode;

  const createGallery = (xPosition: number, yPosition: number) => {
    editMode?.setGalleries(galleries => [
      ...galleries,
      {
        name: 'New Gallery',
        color: 'paper',
        height: 40,
        xPosition,
        yPosition,
        createdAt: new Date(),
      },
    ]);
  };

  const updateGallery = (
    xPosition: number,
    yPosition: number,
    updatedGallery: CreateUpdateGalleryDto,
  ) => {
    editMode?.setGalleries(galleries =>
      galleries.map(gallery => {
        if (gallery.xPosition === xPosition && gallery.yPosition === yPosition) {
          return {
            ...gallery,
            ...updatedGallery,
          };
        }
        return gallery;
      }),
    );
  };

  // TODO: add confirmation modal
  const deleteGallery = (xPosition: number, yPosition: number) => {
    editMode?.setGalleries(galleries =>
      galleries.filter(
        gallery => !(gallery.xPosition === xPosition && gallery.yPosition === yPosition),
      ),
    );
  };

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

      editMode?.setGalleries(galleries =>
        galleries.map(gallery => {
          if (gallery.xPosition === srcXPosition && gallery.yPosition === srcYPosition) {
            return {
              ...gallery,
              xPosition: dstXPosition,
              yPosition: dstYPosition,
            };
          }
          return gallery;
        }),
      );
    } finally {
      setDroppableSourceId(null);
    }
  };

  // Grid width = longest side from the center * 2, plus 1 (to account for x=0 column)
  let gridWidth = Math.max(Math.abs(maxX), Math.abs(minX)) * 2 + 1;
  // Grid height = max y + 1 (y will ALWAYS be greater than 0)
  let gridHeight = maxY + 1;

  if (editMode) {
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
  }, [!!editMode]);

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
                                {!!editMode && (
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
                                            onClick={() => createGallery(xPosition, yPosition)}>
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

                        if (isStrictGallery(gallery)) {
                          return <GalleryBlock key={gallery.id} gallery={gallery} />;
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
                                          style={provided.draggableProps.style}>
                                          <EditGalleryBlock
                                            disabled={disabled}
                                            gallery={gallery}
                                            onChange={updatedGallery =>
                                              updateGallery(xPosition, yPosition, updatedGallery)
                                            }
                                            onDelete={() => deleteGallery(xPosition, yPosition)}
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
