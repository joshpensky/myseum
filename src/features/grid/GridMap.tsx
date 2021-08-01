import { RefObject, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import styles from './styles.module.scss';
import { useGrid } from './useGrid';

interface GridMapProps {
  gridRef: RefObject<HTMLDivElement>;
  viewportRef: RefObject<HTMLDivElement>;
}

export const GridMap = ({ gridRef, viewportRef }: GridMapProps) => {
  const grid = useGrid();

  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport && gridRef.current) {
      // Track the visible and scroll width by attaching an observer
      // to both the viewport (scrollable) and the grid (expandable)
      const resizeObserver = new ResizeObserver(() => {
        setVisibleWidth(viewport.clientWidth);
        setScrollWidth(viewport.scrollWidth);
      });
      resizeObserver.observe(viewport);
      resizeObserver.observe(gridRef.current);

      // Updates the `scrollLeft` state on scroll
      const onScroll = () => {
        setScrollLeft(viewport.scrollLeft);
      };
      onScroll();
      viewport.addEventListener('scroll', onScroll);

      return () => {
        resizeObserver.disconnect();
        viewport.removeEventListener('scroll', onScroll);
      };
    }
  }, []);

  /**
   * Updates the viewport scroll when the scrollbar has been dragged.
   *
   * @param pointerX the pointer's client X position
   */
  const onDragScroll = (pointerX: number) => {
    const viewport = viewportRef.current;
    const scrollbar = scrollbarRef.current;
    if (!viewport || !scrollbar) {
      return;
    }

    const scrollbarRect = scrollbar.getBoundingClientRect();

    // Calculates the ratio from the viewport scroll width to the scrollbar width
    const mappedRatio = viewport.scrollWidth / scrollbarRect.width;

    // Calculates the width of the scrollbar thumb
    const percentVisible = viewport.clientWidth / viewport.scrollWidth;
    const thumbWidth = percentVisible * scrollbarRect.width;

    // Updates X so the pointer is always in the center of the thumb
    // and 0 starts at the left of the scrollbar
    const translatedPointerX = pointerX - scrollbarRect.left - thumbWidth / 2;
    // Then updates the viewport scroll position
    viewport.scrollLeft = translatedPointerX * mappedRatio;
  };

  useEffect(() => {
    // Toggle the scroll dragging class (to prevent text selection in Safari)
    document.body.classList.toggle(styles.scrollDragging, isDragging);

    if (isDragging) {
      // Updates the scroll when the pointer moves
      const onPointerMove = (evt: PointerEvent) => {
        onDragScroll(evt.clientX);
      };

      // Cancels dragging when the pointer ups
      const onPointerCancel = () => {
        setIsDragging(false);
      };

      // Attaches event listeners
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerCancel);
      document.addEventListener('pointercancel', onPointerCancel);
      // Then removes event listeners
      return () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerCancel);
        document.removeEventListener('pointercancel', onPointerCancel);
      };
    }
  }, [isDragging]);

  // Renders the grid items
  const gridItems = grid.items.map(item => {
    let refItem = item;
    let isItemMoving = false;
    if (grid.projectedItem) {
      isItemMoving = grid.getItemId(item) === grid.getItemId(grid.projectedItem);
      if (isItemMoving) {
        refItem = grid.projectedItem;
      }
    }

    return (
      <rect
        className={cx(styles.scrollbarGridItem, isItemMoving && styles.scrollbarGridItemMoving)}
        key={grid.getItemId(item)}
        x={refItem.position.x}
        y={refItem.position.y}
        width={refItem.size.width}
        height={refItem.size.height}
        fill="currentColor"
      />
    );
  });

  const { width, height } = grid.size;
  // Calculate percent visible (0->1) as the visible width within the entire scroll width
  const percentVisible = !scrollWidth ? 1 : visibleWidth / scrollWidth;
  // Calculate percent scrolled (0->1) as the scroll left within the entire scroll width
  const percentScrolled = !scrollWidth ? 0 : scrollLeft / scrollWidth;

  // Renders the scrollbar thumb
  const scrollbarThumb = (
    <rect
      fill="currentColor"
      transform={`translate(${percentScrolled * width} 0)`}
      x={0}
      y={0}
      width={percentVisible * width}
      height={height}
    />
  );

  return (
    <div
      ref={scrollbarRef}
      className={styles.scrollbarWrapper}
      style={{ '--grid-width': Math.round(width), '--grid-height': Math.round(height) }}
      onPointerDown={evt => {
        onDragScroll(evt.clientX);
        setIsDragging(true);
      }}>
      <div className={styles.scrollbarInner}>
        <svg
          className={styles.scrollbarSvg}
          viewBox={[0, 0, width, height].join(' ')}
          preserveAspectRatio="none">
          <defs>
            <mask id="scroller-mask" fill="black">
              <rect fill="white" x={0} y={0} width={width} height={height} />
              {scrollbarThumb}
            </mask>
            <mask id="grid-mask" fill="black">
              <rect fill="white" x={0} y={0} width={width} height={height} />
              {gridItems}
            </mask>
          </defs>
          <g mask="url(#scroller-mask)">{gridItems}</g>
          <g mask="url(#grid-mask)">{scrollbarThumb}</g>
        </svg>
      </div>
    </div>
  );
};
