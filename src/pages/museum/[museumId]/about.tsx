import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Museum, User } from '@prisma/client';
import * as z from 'zod';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { MuseumAboutLayout } from '@src/layouts/museum';

export interface MuseumAboutProps {
  basePath: string;
  museum: Museum & {
    curator: User;
  };
}

const MuseumAbout = ({ museum }: MuseumAboutProps) => (
  <div>
    <Head>
      <title>About | {museum.name}</title>
    </Head>

    <h1>About the Curator</h1>

    <p>{museum.curator.bio}</p>
  </div>
);

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
    const museum = await MuseumRepository.findById(museumId.data);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    return {
      props: {
        basePath: `/museum/${museum.id}`,
        museum: JSON.parse(JSON.stringify(museum)),
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
