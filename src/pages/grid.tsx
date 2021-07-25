import Head from 'next/head';
import Grid from '@src/features/grid';

const GridPage = () => (
  <div suppressHydrationWarning>
    <Head>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    </Head>
    {typeof window !== 'undefined' && <Grid />}
  </div>
);

export default GridPage;
