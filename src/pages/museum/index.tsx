import { GetServerSideProps } from 'next';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { supabase } from '@src/data/supabase';
import { MuseumMapViewProps } from './[museumId]/index';

export { default } from '@src/pages/museum/[museumId]/index';

export const getServerSideProps: GetServerSideProps<MuseumMapViewProps> = async ctx => {
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
    const museum = await MuseumRepository.findOneByUser(auth.user);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    return {
      props: {
        basePath: '/museum',
        museum,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
