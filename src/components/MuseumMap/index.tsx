import { Dispatch, SetStateAction, useState } from 'react';
import tw from 'twin.macro';
import { Gallery } from '@prisma/client';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
  OnDragStartResponder,
} from 'react-beautiful-dnd';
// import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import EditGalleryBlock from './EditGalleryBlock';
import Entrance from './Entrance';
import GalleryBlock from './GalleryBlock';

interface MuseumMapProps {
  isEditing?: boolean;
  galleries: Gallery[];
  setGalleries: Dispatch<SetStateAction<Gallery[]>>;
}

const MuseumMap = ({ isEditing, galleries, setGalleries }: MuseumMapProps) => {
  const [droppableSourceId, setDroppableSourceId] = useState<string | null>(null);

  let minX = 0;
  let maxX = 0;
  let maxY = 0;

  const galleryMap = new Map<number, Map<number, Gallery>>();

  // A map of coordinates to galleries
  // { [xPos]: { [yPos]: Gallery } }
  galleries.forEach(gallery => {
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

  const onDragStart: OnDragStartResponder = initial => {
    setDroppableSourceId(initial.source.droppableId);
  };

  const onGalleryChange = (updatedGallery: Gallery) => {
    setGalleries(
      galleries.map(gallery => {
        if (gallery.id === updatedGallery.id) {
          return {
            ...gallery,
            ...updatedGallery,
          };
        }
        return gallery;
      }),
    );
  };

  const onDragEnd: OnDragEndResponder = result => {
    try {
      if (!result.destination) {
        return;
      }
      const [xPosition, yPosition] = result.destination.droppableId
        .split(':')
        .map(str => Number.parseInt(str));

      setGalleries(
        galleries.map(gallery => {
          if (gallery.id === Number.parseInt(result.draggableId)) {
            return {
              ...gallery,
              xPosition,
              yPosition,
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

  if (isEditing) {
    gridWidth += 2;
    gridHeight += 1;
  }

  // Get the starting X position (where center x=0)
  const startingX = (gridWidth - 1) / -2;

  // const containerRef = useRef<HTMLDivElement>(null);
  // useIsomorphicLayoutEffect(() => {
  //   if (containerRef.current) {
  //     const observer = new ResizeObserver(entries => {
  //       const [container] = entries;
  //       console.log(container);
  //     });
  //     observer.observe(containerRef.current);
  //     return () => {
  //       observer.disconnect();
  //     };
  //   }
  // }, []);

  return (
    <div css={[tw`relative flex-1 w-full`]}>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div css={tw`absolute inset-0 overflow-auto`}>
          <div /* ref={containerRef} */ css={[tw`p-6 flex flex-col items-center`]}>
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
                          const isDroppableAbove =
                            galleryMapForX?.get(yPosition - 1) &&
                            droppableSourceId !== `${xPosition}:${yPosition - 1}`;
                          const isDroppableBelow =
                            galleryMapForX?.get(yPosition + 1) &&
                            droppableSourceId !== `${xPosition}:${yPosition + 1}`;
                          const isDroppableLeft =
                            galleryMap.get(xPosition - 1)?.get(yPosition) &&
                            droppableSourceId !== `${xPosition - 1}:${yPosition}`;
                          const isDroppableRight =
                            galleryMap.get(xPosition + 1)?.get(yPosition) &&
                            droppableSourceId !== `${xPosition + 1}:${yPosition}`;

                          const isDroppable =
                            isDroppableAbove ||
                            isDroppableBelow ||
                            isDroppableLeft ||
                            isDroppableRight;

                          const isInvalid = xPosition === 0 && yPosition === 0;

                          return (
                            <div key={droppableId} css={tw`flex flex-shrink-0 m-2.5`}>
                              <div css={[tw`relative block w-96 ratio-4-3 rounded-lg bg-gray-100`]}>
                                {isEditing && (
                                  <Droppable
                                    droppableId={droppableId}
                                    isDropDisabled={!isDroppable}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        css={[
                                          tw`absolute inset-0 rounded-lg flex`,
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
                                          <p css={tw`text-red-600 text-center self-center w-full`}>
                                            There must be a gallery at the entrance.
                                          </p>
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

                        if (isEditing) {
                          return (
                            <div key={droppableId} css={tw`flex flex-shrink-0 m-2.5`}>
                              <div css={[tw`relative block w-96 ratio-4-3 rounded-lg`]}>
                                <Droppable
                                  key={droppableId}
                                  droppableId={droppableId}
                                  isDropDisabled={droppableSourceId !== droppableId}>
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
                                        key={gallery.id}
                                        draggableId={String(gallery.id)}
                                        index={0}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            css={[tw`block w-96`]}
                                            {...provided.draggableProps}
                                            style={provided.draggableProps.style}>
                                            <EditGalleryBlock
                                              gallery={gallery}
                                              onChange={onGalleryChange}
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
                        }

                        // Otherwise, render gallery block
                        return <GalleryBlock key={gallery.id} gallery={gallery} />;
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
