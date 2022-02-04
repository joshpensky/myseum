import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Loader } from '@src/components/Loader';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { UserRepository } from '@src/data/repositories/user.repository';
import { GalleryDto, GallerySerializer } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumSerializer } from '@src/data/serializers/museum.serializer';
import { supabase } from '@src/data/supabase';
import { AnonymousHome } from '@src/features/anonymous/Home';
import { MuseumView } from '@src/features/museum/MuseumView';
import { useAuth } from '@src/providers/AuthProvider';
import styles from './_styles/index.module.scss';

interface HomeProps {
  galleries: GalleryDto[];
  museum: MuseumDto | null;
}

const Home = ({ galleries, museum }: HomeProps) => {
  const auth = useAuth();
  const router = useRouter();

  // Forces a server-side refresh when user signs in on homepage
  useEffect(() => {
    if (!museum && (auth.user || auth.isUserLoading)) {
      router.reload();
    }
  }, [museum, auth.user, auth.isUserLoading]);

  if (!museum && (auth.user || auth.isUserLoading)) {
    return (
      <div className={styles.wrapper}>
        <h1 className="sr-only">Loading...</h1>

        <Loader size="large" />
      </div>
    );
  }

  if (!museum || !auth.user) {
    return <AnonymousHome />;
  }

  return <MuseumView museum={museum} galleries={galleries} />;
};

export default Home;

export const getServerSideProps: GetServerSideProps<HomeProps> = async ctx => {
  const supabaseUser = await supabase.auth.api.getUserByCookie(ctx.req);
  if (!supabaseUser.user) {
    return {
      props: {
        __supabaseUser: null,
        museum: null,
        galleries: [],
      },
    };
  }
  const userData = await UserRepository.findOne(supabaseUser.user);

  const museum = await MuseumRepository.findOneByCurator(supabaseUser.user.id);
  if (!museum) {
    throw new Error('User must have museum.');
  }

  const serializedMuseum = MuseumSerializer.serialize(museum);

  const galleries = await GalleryRepository.findAllByMuseum(museum.id);
  const serializedGalleries = galleries.map(gallery => GallerySerializer.serialize(gallery));

  return {
    props: {
      __supabaseUser: supabaseUser.user,
      __userData: userData,
      museum: serializedMuseum,
      galleries: serializedGalleries,
    },
  };
};
