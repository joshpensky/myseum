import React from 'react';
import { render } from 'react-dom';
import App from '@src/App';
import '@src/style/index.scss';

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
