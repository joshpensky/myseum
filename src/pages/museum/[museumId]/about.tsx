import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import * as z from 'zod';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { MuseumDto, MuseumSerializer } from '@src/data/serializers/museum.serializer';
// import { MuseumLayout, MuseumLayoutProps } from '@src/layouts/MuseumLayout';
import { PageComponent } from '@src/types';

export interface MuseumAboutProps {
  museum: MuseumDto;
}

const MuseumAbout: PageComponent<MuseumAboutProps> = ({ museum }) => (
  <div>
    <Head>
      <title>About | {museum.name} | Myseum</title>
    </Head>

    <h1>About the Curator</h1>

    <p>{museum.curator.bio}</p>
  </div>
);

// MuseumAbout.layout = MuseumLayout;
MuseumAbout.getPageLayoutProps = pageProps => ({
  museum: pageProps.museum,
});
MuseumAbout.getGlobalLayoutProps = pageProps => ({
  navOverrides: {
    left: (
      <Link passHref href={`/museum/${pageProps.museum.id}`}>
        <a>Back</a>
      </Link>
    ),
  },
});

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
