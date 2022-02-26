import { GetServerSideProps } from 'next';
import { Loader } from '@src/components/Loader';
import { SEO } from '@src/components/SEO';
import { UserRepository } from '@src/data/repositories/user.repository';
import { UserSerializer } from '@src/data/serializers/user.serializer';
import { supabase } from '@src/data/supabase';
import { UserView } from '@src/features/profile/UserView';
import { useAuth } from '@src/providers/AuthProvider';
import styles from './_styles/me.module.scss';

const Profile = () => {
  const auth = useAuth();

  if (!auth.user) {
    return (
      <div className={styles.wrapper}>
        <SEO title="Redirecting..." />

        <h1 className="sr-only">Redirecting...</h1>

        <Loader size="large" />
      </div>
    );
  }

  return <UserView user={auth.user} />;
};

export default Profile;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const supabaseUser = await supabase.auth.api.getUserByCookie(ctx.req);

  // If user not logged in, redirect to homepage
  if (!supabaseUser.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const user = await UserRepository.findOne(supabaseUser.user);
  const serializedUser = UserSerializer.serialize(user);

  // Otherwise, continue onward!
  return {
    props: {
      __supabaseUser: supabaseUser.user,
      __userData: serializedUser,
    },
  };
};
