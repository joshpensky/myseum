import { GetServerSideProps } from 'next';
import Head from 'next/head';
import * as z from 'zod';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { MuseumDto, MuseumSerializer } from '@src/data/MuseumSerializer';
import { MuseumAboutLayout } from '@src/layouts/museum';
import { useMuseum } from '@src/providers/MuseumProvider';

export interface MuseumAboutProps {
  museum: MuseumDto;
}

const MuseumAbout = () => {
  const { museum } = useMuseum();

  return (
    <div>
      <Head>
        <title>About | {museum.name} | Myseum</title>
      </Head>

      <h1>About the Curator</h1>

      <p>{museum.curator.bio}</p>
    </div>
  );
};

MuseumAbout.Layout = MuseumAboutLayout;

export default MuseumAbout;

export const getServerSideProps: GetServerSideProps<
  MuseumAboutProps,
  { museumId: string }
> = async ctx => {
  const museumId = z.number().int().safeParse(Number(ctx.params?.museumId));
  if (!museumId.success) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = await MuseumRepository.findOne(museumId.data);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    return {
      props: {
        museum: MuseumSerializer.serialize(museum),
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
