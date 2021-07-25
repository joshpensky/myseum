import { PropsWithChildren, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import { Size } from './types';
import { GridContext } from './useGrid';

const cx = classNames.bind(styles);

interface GridProps {
  size: Size;
}
export function Grid({ children, size }: PropsWithChildren<GridProps>) {
  const gridRef = useRef<HTMLDivElement>(null);

  const unitPx = 30;

  return (
    <GridContext.Provider value={{ size, unitPx }}>
      <div
        ref={gridRef}
        className={cx('grid')}
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
