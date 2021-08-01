import { PropsWithChildren, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import cx from 'classnames';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import styles from './styles.module.scss';
import { GridContext, useGrid } from './useGrid';

const GRID_Y_MARGIN = Number.parseInt(styles.varGridYMargin);

const GridMap = dynamic(async () => {
  const module = await import('./GridMap');
  return module.GridMap;
});

interface GridBaseProps {
  className?: string;
}

export function GridBase({ children, className }: PropsWithChildren<GridBaseProps>) {
  const grid = useGrid();

  const rootElRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [widthPx, setWidthPx] = useState(0);
  const [heightPx, setHeightPx] = useState(0);

  // Observe resizes to the page grid
  useIsomorphicLayoutEffect(() => {
    if (rootElRef.current) {
      const observer = new ResizeObserver(entries => {
        const [rootEl] = entries;
        setHeightPx(rootEl.contentRect.height);
        setWidthPx(rootEl.contentRect.width);
      });
      observer.observe(rootElRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const gridMarginPx = grid.preview ? 0 : GRID_Y_MARGIN * 3;

  // Calculate the grid unit size as the element height divided by the grid size height (# of rows)
  const unitPx = (heightPx - gridMarginPx) / grid.size.height;
  // Calculate an even unit px size used for crisp background lines
  const evenUnitPx = Math.round(unitPx);

  const gridWidth = Math.max(grid.size.width, widthPx / unitPx);

  return (
    <GridContext.Provider value={{ ...grid, unitPx }}>
      <div ref={rootElRef} className={cx(styles.root, grid.preview && styles.rootPreview)}>
        <div
          ref={gridRef}
          className={cx(styles.grid, grid.step >= 1 && styles.gridLarge, className)}
          style={{
            '--grid-step': grid.step,
            '--unit-px': `${unitPx}px`,
            '--even-unit-px': `${evenUnitPx}px`,
            // Calculate a scale from the even unit size to the reguluar unit size
            // This will allow us to render crisp lines, and then scale them to the size we need it
            '--scale': unitPx / evenUnitPx,
            '--grid-width': gridWidth,
            '--grid-height': grid.size.height,
          }}>
          {children}
        </div>

        {!grid.preview && (
          <GridContext.Provider
            value={{ ...grid, unitPx, size: { height: grid.size.height, width: gridWidth } }}>
            <GridMap viewportRef={rootElRef} gridRef={gridRef} />
          </GridContext.Provider>
        )}
      </div>
    </GridContext.Provider>
  );
}
