import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getMuseum } from '@src/data/static';
import { getMuseumAboutLayout } from '@src/layouts/MuseumLayout';
import { Museum } from '@src/types';

export interface MuseumAboutProps {
  museum: Museum;
}

const MuseumAbout = ({ museum }: MuseumAboutProps) => (
  <div>
    <Head>
      <title>About | {museum.name}</title>
    </Head>

    <h1>About</h1>
  </div>
);

MuseumAbout.getLayout = getMuseumAboutLayout;

export default MuseumAbout;

export const getServerSideProps: GetServerSideProps<
  MuseumAboutProps,
  { museumId: string }
> = async ctx => {
  const museumIdStr = ctx.params?.museumId;
  if (!museumIdStr) {
    return {
      notFound: true,
    };
  }

  const museumId = Number.parseInt(museumIdStr);
  if (!Number.isFinite(museumId)) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = getMuseum(museumId);
    return {
      props: {
        museum: JSON.parse(JSON.stringify(museum)),
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
