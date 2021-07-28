import { PropsWithChildren, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import { Size } from './types';
import { GridContext } from './useGrid';

const cx = classNames.bind(styles);

interface GridProps {
  className?: string;
  size: Size;
  unitPx: number;
}
export function Grid({ children, className, size, unitPx }: PropsWithChildren<GridProps>) {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <GridContext.Provider value={{ size, unitPx }}>
      <div
        ref={gridRef}
        className={cx('grid', className)}
        style={{
          '--unit-size': unitPx,
          '--grid-width': size.width,
          '--grid-height': size.height,
        }}>
        {children}
      </div>
    </GridContext.Provider>
  );
}
