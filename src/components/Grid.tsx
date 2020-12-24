import { useLayoutEffect, useRef, useState, useEffect, ReactElement } from 'react';
import tw, { css } from 'twin.macro';
import { GridProvider } from '@src/providers/GridProvider';
import { GridItemProps } from './GridItem';
import GridMap from './GridMap';
import GridLines from './GridLines';

export type GridProps = {
  children: ReactElement<GridItemProps>[]; // force only GridItem children
  minColumns?: number;
  rows: number;
  showLines?: boolean;
};

// A buffer of columns to display offscreen
const COLUMN_BUFFER = 10;

const Grid = ({ children, minColumns, rows, showLines }: GridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);

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
    // Get the previous X scroll position
    const prevX = xPosRef.current;
    // Get the maximum X position
    const max = gridWidth - visibleWidth;
    // Get the next X position (previous + delta), capped by the max
    const nextX = Math.max(0, Math.min(max, prevX + delta));
    // Update X position state
    xPosRef.current = nextX;
    setXPos(nextX);
  };

  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (evt: MouseEvent) => {
    startXRef.current = evt.clientX;
    setIsDragging(true);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  const onDrag = (evt: MouseEvent) => {
    const delta = startXRef.current - evt.clientX;
    startXRef.current = evt.clientX;
    onScroll(delta);
  };

  // As the user drags, update the X position
  useEffect(() => {
    if (isDragging) {
      dragAreaRef.current?.addEventListener('mousemove', onDrag);
      return () => {
        dragAreaRef.current?.removeEventListener('mousemove', onDrag);
      };
    }
  }, [isDragging, visibleWidth]);

  // Add drag start/end listeners on mount
  useEffect(() => {
    if (dragAreaRef.current) {
      dragAreaRef.current.addEventListener('mousedown', onDragStart);
      dragAreaRef.current.addEventListener('mouseup', onDragEnd);
      dragAreaRef.current.addEventListener('mouseleave', onDragEnd);
      return () => {
        if (dragAreaRef.current) {
          dragAreaRef.current.removeEventListener('mousedown', onDragStart);
          dragAreaRef.current.removeEventListener('mouseup', onDragEnd);
          dragAreaRef.current.removeEventListener('mouseleave', onDragEnd);
        }
      };
    }
  }, []);

  // On mount, start resize observer for container width + height
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
    <GridProvider
      itemSize={itemSize}
      columns={columns}
      rows={rows}
      percentScrolled={gridWidth ? xPos / gridWidth : 0}
      percentVisible={gridWidth ? visibleWidth / gridWidth : 0}>
      <div css={tw`flex flex-col flex-1 my-6 overflow-hidden`}>
        <div ref={containerRef} css={[tw`flex flex-1 relative`]}>
          <div
            ref={dragAreaRef}
            css={[tw`absolute inset-0 size-full cursor-grab active:cursor-grabbing`]}
          />
          <div
            css={[
              tw`absolute inset-0 size-full pointer-events-none`,
              css`
                transform: translateX(${-1 * xPos}px);
              `,
            ]}>
            {showLines && <GridLines />}
            {children}
          </div>
        </div>

        <div css={tw`mt-6 flex flex-col justify-center w-full`}>
          <GridMap>{children}</GridMap>
        </div>
      </div>
    </GridProvider>
  );
};

export default Grid;
