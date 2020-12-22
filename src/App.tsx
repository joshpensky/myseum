import Layout from '@src/components/Layout';
import { SWRProvider } from '@src/providers/SWRProvider';

const App = () => (
  <SWRProvider>
    <Layout>
      <header>
        <h1>Gallery</h1>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </Layout>
  </SWRProvider>
);

export default App;
