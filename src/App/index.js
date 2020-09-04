import React, { useState } from 'react';
import Grid from '@src/components/Grid';
import styles from './app.module.scss';

const App = () => {
  const [wallHeight, setWallHeight] = useState(40);

  return (
    <div className={styles.container}>
      <h1>Gallery</h1>
      <div>
        <label htmlFor="wallHeight">Wall Height</label>
        <input
          id="wallHeight"
          type="number"
          min={0}
          step={1}
          value={wallHeight}
          onChange={e => setWallHeight(Number(e.target.value))}
        />
        in
      </div>
      <Grid rows={wallHeight} />
    </div>
  );
};

export default App;
