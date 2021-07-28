import { PropsWithChildren } from 'react';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import { useGrid } from './useGrid';

const cx = classNames.bind(styles);

interface GridBaseProps {
  className?: string;
}

export function GridBase({ children, className }: PropsWithChildren<GridBaseProps>) {
  const grid = useGrid();

  return (
    <div
      className={cx('grid', className)}
      style={{
        '--unit-size': grid.unitPx,
        '--grid-width': grid.size.width,
        '--grid-height': grid.size.height,
      }}>
      {children}
    </div>
  );
}
