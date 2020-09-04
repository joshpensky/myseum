import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import anime from 'animejs';
import c from 'classnames';
import styles from './grid.module.scss';

// A buffer of columns to display offscreen
const COLUMN_BUFFER = 10;

const Grid = ({ minColumns, rows }) => {
  /** @type {React.MutableRefObject<HTMLDivElement>} */
  const containerRef = useRef(null);
  /** @type {React.MutableRefObject<HTMLDivElement>} */
  const gridRef = useRef(null);

  const [height, setHeight] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(window.innerWidth);

  const itemSize = height / rows;
  let minColumnsForWidth = COLUMN_BUFFER;
  if (itemSize > 0) {
    minColumnsForWidth += Math.ceil(visibleWidth / itemSize);
  }
  const columns = Math.max(minColumns, minColumnsForWidth);
  const gridWidth = columns * itemSize;

  const xRef = useRef(0);
  const startXRef = useRef(0);

  const updateScroll = () => {
    anime({
      targets: [gridRef.current],
      translateX: -1 * xRef.current,
      duration: 0,
    });
  };

  const onScroll = delta => {
    const prevX = xRef.current;
    const max = gridWidth - visibleWidth;
    const nextX = Math.max(0, Math.min(max, prevX + delta));
    xRef.current = nextX;

    if (nextX !== prevX) {
      requestAnimationFrame(updateScroll);
    }
  };

  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onResize = entries => {
    const entry = entries[0];
    setHeight(entry.contentRect.height);
    setVisibleWidth(entry.contentRect.width);
  };

  const onKeyDown = evt => {
    switch (evt.key) {
      case ' ':
      case 'Spacebar': {
        setIsDragEnabled(true);
      }
    }
  };

  const onKeyUp = evt => {
    switch (evt.key) {
      case ' ':
      case 'Spacebar': {
        setIsDragEnabled(false);
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
      containerRef.current.addEventListener('mousemove', onDrag);

      return () => {
        containerRef.current.removeEventListener('mousemove', onDrag);
      };
    }
  }, [isDragging, visibleWidth]);

  useEffect(() => {
    if (isDragEnabled) {
      containerRef.current.addEventListener('mousedown', onDragStart);
      containerRef.current.addEventListener('mouseup', onDragEnd);
      containerRef.current.addEventListener('mouseleave', onDragEnd);

      return () => {
        containerRef.current.removeEventListener('mousedown', onDragStart);
        containerRef.current.removeEventListener('mouseup', onDragEnd);
        containerRef.current.removeEventListener('mouseleave', onDragEnd);
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
  }, []);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(onResize);
    observer.observe(containerRef.current);
    return observer.disconnect;
  }, []);

  return (
    <div
      ref={containerRef}
      className={c(
        styles.container,
        isDragEnabled && styles.containerDraggable,
        isDragging && styles.containerDragging,
      )}>
      <div
        ref={gridRef}
        className={styles.grid}
        style={{
          '--grid-item-size': `${itemSize}px`,
          '--grid-items': columns,
        }}>
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
    </div>
  );
};

Grid.propTypes = {
  rows: PropTypes.number.isRequired,
  minColumns: PropTypes.number,
};

Grid.defaultProps = {
  minColumns: 0,
};

export default Grid;
