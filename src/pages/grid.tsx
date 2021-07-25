import { useState } from 'react';
import Head from 'next/head';
import classNames from 'classnames/bind';
import Grid from '@src/features/grid';
import styles from '@src/features/grid/styles.module.scss';
import { Position, Size } from '@src/features/grid/types';

const cx = classNames.bind(styles);

interface BaseItem {
  position: Position;
  size: Size;
}

const GridPage = () => {
  const [gridSize, setGridSize] = useState({ width: 10, height: 20 });

  const [items, setItems] = useState<(BaseItem & { id: number; color: string })[]>([
    {
      id: 1,
      color: 'rebeccapurple',
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
    },
    {
      id: 2,
      color: 'pink',
      position: { x: 5, y: 6 },
      size: { width: 2, height: 3 },
    },
    {
      id: 3,
      color: 'MediumSeaGreen',
      position: { x: 2, y: 14 },
      size: { width: 5, height: 2 },
    },
  ]);

  return (
    <div>
      <Head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <Grid
        size={gridSize}
        onSizeChange={size => setGridSize(size)}
        items={items}
        getItemId={item => String(item.id)}
        onItemChange={(idx, item) => {
          setItems([...items.slice(0, idx), item, ...items.slice(idx + 1)]);
        }}
        renderItem={(item, props) => (
          <div
            className={cx('wrapper', props.error)}
            aria-disabled={props.disabled}
            style={{ color: item.color }}>
            <div className={cx('box', !!props.moveType && 'box--moving')} />

            <button {...props.dragHandleProps} className={cx('drag-handle')} aria-label="Drag">
              <span className="material-icons" aria-hidden="true">
                drag_indicator
              </span>
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default GridPage;
