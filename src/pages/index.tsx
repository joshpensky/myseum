import Head from 'next/head';
import tw from 'twin.macro';

const Home = () => (
  <div>
    <Head>
      <title>Home</title>
    </Head>
    <h1 css={[tw`font-serif text-4xl`]}>Home</h1>
  </div>
);

export default Home;
