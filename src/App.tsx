import { SWRProvider } from './providers/SWRProvider';

const App = () => (
  <SWRProvider>
    <div>
      <header>
        <h1>Gallery</h1>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  </SWRProvider>
);

export default App;
