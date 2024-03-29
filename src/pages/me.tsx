import { GetServerSideProps } from 'next';
import { withPageAuth } from '@supabase/supabase-auth-helpers/nextjs';
import api from '@src/api/server';
import { Loader } from '@src/components/Loader';
import { SEO } from '@src/components/SEO';
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

export const getServerSideProps: GetServerSideProps = withPageAuth({
  redirectTo: '/',
  async getServerSideProps(ctx) {
    const user = await api.auth.findUserByCookie(ctx);
    return {
      props: {
        __authUser: user,
      },
    };
  },
});
