import React from 'react';
import c from 'classnames';
import styles from './app.module.scss';

const App = () => (
  <div>
    <header className={c(styles.test, { [styles.testGreen]: true })}>
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
        Learn React
      </a>
    </header>
  </div>
);

export default App;
