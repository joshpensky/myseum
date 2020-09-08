import React, { useLayoutEffect, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import { useState } from '@upstatement/react-hooks';
import { GridContext } from '@src/utils/contexts';
import styles from './grid.module.scss';

// A buffer of columns to display offscreen
const COLUMN_BUFFER = 10;

const Grid = ({ children, minColumns, rows }) => {
  /** @type {React.MutableRefObject<HTMLDivElement>} */
  const containerRef = useRef(null);
  /** @type {React.MutableRefObject<HTMLDivElement>} */
  const gridRef = useRef(null);

  const [height, setHeight] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(window.innerWidth);

  const onResize = entries => {
    const entry = entries[0];
    setHeight(entry.contentRect.height);
    setVisibleWidth(entry.contentRect.width);
  };

  const itemSize = rows ? height / rows : 0;
  let minColumnsForWidth = 100;
  if (itemSize > 0) {
    minColumnsForWidth = Math.ceil(visibleWidth / itemSize);
  }
  const columns = Math.max(minColumns, minColumnsForWidth) + COLUMN_BUFFER;
  const gridWidth = columns * itemSize;

  const [xPos, setXPos] = useState(0);
  const xPosRef = useRef(0);
  const startXRef = useRef(0);

  const onScroll = delta => {
    const prevX = xPosRef.current;

    const max = gridWidth - visibleWidth;
    const nextX = Math.max(0, Math.min(max, prevX + delta));

    xPosRef.current = nextX;
    setXPos(nextX);
  };

  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onKeyDown = evt => {
    switch (evt.key) {
      // Enable dragging
      case 'Spacebar':
      case ' ': {
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

  const onKeyUp = evt => {
    switch (evt.key) {
      // Disable dragging
      case 'Spacebar':
      case ' ': {
        setIsDragEnabled(false);
        break;
      }
    }
  };

  const onDragStart = evt => {
    evt.preventDefault();
    startXRef.current = evt.clientX;
    setIsDragging(true);
  };

  const onDragEnd = evt => {
    evt.preventDefault();
    setIsDragging(false);
  };

  const onDrag = evt => {
    evt.preventDefault();
    const delta = startXRef.current - evt.clientX;
    startXRef.current = evt.clientX;
    onScroll(delta);
  };

  useEffect(() => {
    if (isDragging) {
      const container = containerRef.current;
      container.addEventListener('mousemove', onDrag);

      return () => {
        container.removeEventListener('mousemove', onDrag);
      };
    }
  }, [isDragging, visibleWidth]);

  useEffect(() => {
    if (isDragEnabled) {
      const container = containerRef.current;
      container.addEventListener('mousedown', onDragStart);
      container.addEventListener('mouseup', onDragEnd);
      container.addEventListener('mouseleave', onDragEnd);

      return () => {
        container.removeEventListener('mousedown', onDragStart);
        container.removeEventListener('mouseup', onDragEnd);
        container.removeEventListener('mouseleave', onDragEnd);
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
    const observer = new ResizeObserver(onResize);
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef}
        className={c(
          styles.gridContainer,
          isDragEnabled && styles.gridContainerDraggable,
          isDragging && styles.gridContainerDragging,
        )}
        style={{
          '--grid-item-size': `${itemSize}px`,
          '--grid-items': columns,
          '--scroll-offset': `${-1 * xPos}px`,
        }}>
        <div ref={gridRef} className={styles.grid}>
          <div className={styles.gridInner}>
            <div className={styles.gridRows}>
              {Array.apply(null, Array(rows)).map((_, idx) => (
                <div key={idx} className={styles.gridRowsItem} />
              ))}
            </div>
            <div className={styles.gridColumns}>
              {Array.apply(null, Array(columns)).map((_, idx) => (
                <div key={idx} className={styles.gridColumnsItem} />
              ))}
            </div>
          </div>
          <GridContext.Provider value={{ itemSize }}>{children}</GridContext.Provider>
        </div>
      </div>

      <div className={styles.indicator}>
        <div className={styles.indicatorBar}>
          <div
            className={styles.indicatorBarThumb}
            style={{
              '--scroll-offset': `${(xPos / gridWidth) * 100}%`,
              '--wall-visibility': `${(visibleWidth / gridWidth) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

Grid.propTypes = {
  children: PropTypes.node,
  rows: PropTypes.number.isRequired,
  minColumns: PropTypes.number,
};

Grid.defaultProps = {
  minColumns: 0,
};

export default Grid;
