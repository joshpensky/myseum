import { useLayoutEffect, useRef, useState, useEffect, PropsWithChildren } from 'react';
import { GridProvider } from '@src/providers/GridProvider';
import tw, { css } from 'twin.macro';

export type GridProps = {
  minColumns?: number;
  rows: number;
};

// A buffer of columns to display offscreen
const COLUMN_BUFFER = 10;

const Grid = ({ children, minColumns, rows }: PropsWithChildren<GridProps>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(window.innerWidth);

  const itemSize = rows ? height / rows : 0;
  let minColumnsForWidth = 100;
  if (itemSize > 0) {
    minColumnsForWidth = Math.ceil(visibleWidth / itemSize);
  }
  const columns = Math.max(minColumns ?? 0, minColumnsForWidth) + COLUMN_BUFFER;
  const gridWidth = columns * itemSize;

  const [xPos, setXPos] = useState(0);
  const xPosRef = useRef(0);
  const startXRef = useRef(0);

  const onScroll = (delta: number) => {
    const prevX = xPosRef.current;

    const max = gridWidth - visibleWidth;
    const nextX = Math.max(0, Math.min(max, prevX + delta));

    xPosRef.current = nextX;
    setXPos(nextX);
  };

  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Spacebar':
      case ' ': {
        // Enable dragging
        setIsDragEnabled(true);
        break;
      }

      case 'Right':
      case 'ArrowRight': {
        // Move the grid to the right by 1 grid square
        if (xPosRef.current < gridWidth - visibleWidth) {
          evt.preventDefault();
          const delta = xPosRef.current % itemSize;
          const remaining = itemSize - delta;
          if (remaining < itemSize / 2) {
            onScroll(itemSize + remaining);
          } else {
            onScroll(remaining);
          }
        }
        break;
      }

      case 'Left':
      case 'ArrowLeft': {
        // Move the grid to the left by 1 grid square
        if (xPosRef.current > 0) {
          evt.preventDefault();
          const delta = xPosRef.current % itemSize;
          const remaining = itemSize - (itemSize - delta);
          if (remaining < itemSize / 2) {
            onScroll(-remaining - itemSize);
          } else {
            onScroll(-remaining);
          }
        }
        break;
      }
    }
  };

  const onKeyUp = (evt: KeyboardEvent) => {
    switch (evt.key) {
      // Disable dragging
      case 'Spacebar':
      case ' ': {
        setIsDragEnabled(false);
        break;
      }
    }
  };

  const onDragStart = (evt: MouseEvent) => {
    evt.preventDefault();
    startXRef.current = evt.clientX;
    setIsDragging(true);
  };

  const onDragEnd = (evt: MouseEvent) => {
    evt.preventDefault();
    setIsDragging(false);
  };

  const onDrag = (evt: MouseEvent) => {
    evt.preventDefault();
    const delta = startXRef.current - evt.clientX;
    startXRef.current = evt.clientX;
    onScroll(delta);
  };

  useEffect(() => {
    if (isDragging) {
      containerRef.current?.addEventListener('mousemove', onDrag);

      return () => {
        containerRef.current?.removeEventListener('mousemove', onDrag);
      };
    }
  }, [isDragging, visibleWidth]);

  useEffect(() => {
    if (isDragEnabled) {
      if (containerRef.current) {
        containerRef.current.addEventListener('mousedown', onDragStart);
        containerRef.current.addEventListener('mouseup', onDragEnd);
        containerRef.current.addEventListener('mouseleave', onDragEnd);
      }

      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('mousedown', onDragStart);
          containerRef.current.removeEventListener('mouseup', onDragEnd);
          containerRef.current.removeEventListener('mouseleave', onDragEnd);
        }
      };
    }
  }, [isDragEnabled]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        setHeight(entry.contentRect.height);
        setVisibleWidth(entry.contentRect.width);
      });

      observer.observe(containerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <div css={tw`flex flex-col flex-1 overflow-hidden`}>
      <div
        ref={containerRef}
        css={[
          tw`my-6 flex flex-1 relative`,
          css`
            --grid-item-size: ${itemSize}px;
            --grid-items: ${columns};
            --scroll-offset: ${-1 * xPos}px;
          `,
          isDragEnabled && tw`cursor-grab`,
          isDragging && tw`cursor-grabbing`,
        ]}>
        <div
          ref={gridRef}
          css={[
            tw`absolute inset-0 size-full`,
            css`
              transform: translateX(var(--scroll-offset));
            `,
          ]}>
          <div
            css={[
              tw`opacity-0 transition-opacity h-full relative ring-1 ring-inset ring-mint-700`,
              css`
                width: calc(var(--grid-item-size) * var(--grid-items));
              `,
              isDragEnabled && tw`opacity-20 transition-none`,
            ]}>
            <div css={tw`absolute inset-0 size-full flex flex-col`}>
              {Array(rows)
                .fill(null)
                .map((_, idx) => (
                  <div
                    key={idx}
                    css={[
                      tw`flex-shrink-0 w-full ring-0.5 ring-inset ring-mint-700`,
                      css`
                        height: var(--grid-item-size);
                      `,
                    ]}
                  />
                ))}
            </div>
            <div css={tw`absolute inset-0 size-full flex`}>
              {Array(columns)
                .fill(null)
                .map((_, idx) => (
                  <div
                    key={idx}
                    css={[
                      tw`flex-shrink-0 h-full ring-0.5 ring-inset ring-mint-700`,
                      css`
                        width: var(--grid-item-size);
                      `,
                    ]}
                  />
                ))}
            </div>
          </div>
          <GridProvider itemSize={itemSize}>{children}</GridProvider>
        </div>
      </div>

      <div css={tw`mb-6 flex flex-col h-8 justify-center w-full`}>
        <div
          css={[
            tw`border border-mint-600 rounded-md h-4 mx-auto overflow-hidden transition-all w-full max-w-2xl`,
            tw`hover:h-8`,
          ]}>
          <div
            css={[
              tw`bg-mint-600 bg-opacity-60 cursor-pointer h-full`,
              css`
                margin-left: ${(xPos / gridWidth) * 100}%;
                width: ${(visibleWidth / gridWidth) * 100}%;
              `,
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Grid;
