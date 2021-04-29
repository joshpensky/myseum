import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getMuseumHomeLayout } from '@src/layouts/MuseumLayout';

interface MuseumDto {
  id: number;
  name: string;
}

export interface MuseumProps {
  museum: MuseumDto;
}

const MuseumCollectionView = ({ museum }: MuseumProps) => (
  <div>
    <Head>
      <title>{museum.name}</title>
    </Head>

    <h1>Collection</h1>
  </div>
);

MuseumCollectionView.getLayout = getMuseumHomeLayout;

export default MuseumCollectionView;

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
