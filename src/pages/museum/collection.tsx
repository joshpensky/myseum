import { GetServerSideProps } from 'next';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { supabase } from '@src/data/supabase';
import { MuseumCollectionViewProps } from '@src/pages/museum/[museumId]/collection';

export { default } from '@src/pages/museum/[museumId]/collection';

export const getServerSideProps: GetServerSideProps<
  MuseumCollectionViewProps,
  { museumId: string }
> = async ctx => {
  const auth = await supabase.auth.api.getUserByCookie(ctx.req);

  if (!auth.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    const museum = await MuseumRepository.findByUser(auth.user);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    return {
      props: {
        basePath: `/museum`,
        museum: JSON.parse(JSON.stringify(museum)),
        collection: [], // TODO: add collection
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
