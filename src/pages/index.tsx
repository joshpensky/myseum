import { GetServerSideProps } from 'next';
import { withPageAuth } from '@supabase/supabase-auth-helpers/nextjs';
import api from '@src/api/server';
import { Loader } from '@src/components/Loader';
import { SEO } from '@src/components/SEO';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import { AnonymousHome } from '@src/features/anonymous/Home';
import { MuseumView } from '@src/features/museum/MuseumView';
import { useAuth } from '@src/providers/AuthProvider';
import styles from './_styles/index.module.scss';

interface HomeProps {
  galleries: GalleryDto[];
  museum: MuseumDto | null;
}

const Home = ({ museum, galleries }: HomeProps) => {
  const auth = useAuth();

  if (!auth.user && !auth.isUserLoading) {
    return <AnonymousHome />;
  }

  if (!museum) {
    return (
      <div className={styles.wrapper}>
        <SEO title="Loading..." />

        <h1 className="sr-only">Loading...</h1>

        <Loader size="large" />
      </div>
    );
  }

  return <MuseumView museum={museum} galleries={galleries} />;
};

export default Home;

export const getServerSideProps: GetServerSideProps<HomeProps> = withPageAuth({
  authRequired: false,
  async getServerSideProps(ctx) {
    const user = await api.auth.findUserByCookie(ctx);
    if (!user) {
      return {
        props: {
          museum: null,
          galleries: [],
        },
      };
    }

    const museum = await api.museum.findOneByCurator(user);
    const galleries = await api.gallery.findAllByMuseum(museum);

    return {
      props: {
        __authUser: user,
        museum,
        galleries,
      },
    };
  },
});
