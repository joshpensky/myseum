import { PropsWithChildren, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { BaseProps } from '@src/types';
import styles from './styles.module.scss';
import { GridContext, useGrid } from './useGrid';

const cx = classNames.bind(styles);

const GRID_Y_MARGIN = Number.parseInt(styles.varGridYMargin);

export function GridBase({ children, className, css }: PropsWithChildren<BaseProps>) {
  const grid = useGrid();

  const rootElRef = useRef<HTMLDivElement>(null);
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

  // Calculate the grid unit size as the element height divided by the grid size height (# of rows)
  const unitPx = (heightPx - GRID_Y_MARGIN * 2) / grid.size.height;
  // Calculate an even unit px size used for crisp background lines
  const evenUnitPx = Math.round(unitPx);

  return (
    <GridContext.Provider value={{ ...grid, unitPx }}>
      <div ref={rootElRef} className={cx('root')}>
        <div
          className={cx('grid', grid.step >= 1 && 'grid--large', className)}
          css={css}
          style={{
            '--grid-step': grid.step,
            '--unit-px': `${unitPx}px`,
            '--even-unit-px': `${evenUnitPx}px`,
            // Calculate a scale from the even unit size to the reguluar unit size
            // This will allow us to render crisp lines, and then scale them to the size we need it
            '--scale': unitPx / evenUnitPx,
            '--grid-width': Math.max(grid.size.width, widthPx / unitPx),
            '--grid-height': grid.size.height,
          }}>
          {children}
        </div>
      </div>
    </GridContext.Provider>
  );
}
