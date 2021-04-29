import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getMuseumAboutLayout } from '@src/layouts/MuseumLayout';

interface MuseumDto {
  id: number;
  name: string;
}

export interface MuseumProps {
  museum: MuseumDto;
}

const MuseumAbout = ({ museum }: MuseumProps) => (
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
  MuseumProps,
  { museumId: string }
> = async ctx => {
  const data: Record<string, MuseumDto> = {
    1: {
      id: 1,
      name: 'Good Museum',
    },
  };

  const museumId = ctx.params?.museumId;
  if (!museumId || !(museumId in data)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      museum: data[museumId],
    },
  };
};
