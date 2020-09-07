import React, { useState } from 'react';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';
import styles from './app.module.scss';

const App = () => {
  const [wallHeight, setWallHeight] = useState(62);

  const gridItems = [
    {
      x: 3,
      y: 25,
      width: 27,
      height: 35,
    },
    {
      x: 36,
      y: 3,
      width: 15,
      height: 15,
    },
    {
      x: 57,
      y: 11,
      width: 19,
      height: 24,
    },
    {
      x: 48,
      y: 40,
      width: 14.2,
      height: 11.4,
    },
    {
      x: 80,
      y: 52,
      width: 10,
      height: 10,
    },
  ];

  const minHeight = gridItems.reduce((acc, { y, height }) => {
    const y2 = y + Math.ceil(height);
    return acc > y2 ? acc : y2;
  });

  const minColumns = gridItems.reduce((acc, { x, width }) => {
    const x2 = x + Math.ceil(width);
    return acc > x2 ? acc : x2;
  }, 0);

  return (
    <div className={styles.container}>
      <h1>Gallery</h1>
      <div>
        <label htmlFor="wallHeight">Wall Height</label>
        <input
          id="wallHeight"
          type="number"
          step={1}
          min={minHeight}
          value={wallHeight}
          onChange={e => setWallHeight(Number(e.target.value))}
        />
        in
      </div>
      <Grid rows={wallHeight} minColumns={minColumns}>
        {gridItems.map(({ x, y, width, height }, idx) => (
          <GridItem key={idx} x={x} y={y} width={width} height={height} />
        ))}
      </Grid>
    </div>
  );
};

export default App;
