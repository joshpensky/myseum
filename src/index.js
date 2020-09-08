import React from 'react';
import { render } from 'react-dom';
import App from '@src/App';
import msw from '@src/data/msw';
import '@src/style/index.scss';

msw.start();

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
