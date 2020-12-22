import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from '@src/App';
import { mockServiceWorker } from '@src/mocks/browser';
import reportWebVitals from '@src/reportWebVitals';

mockServiceWorker.start();

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
