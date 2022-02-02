import { GetServerSideProps } from 'next';
import { UserRepository } from '@src/data/repositories/user.repository';
import { UserSerializer } from '@src/data/serializers/user.serializer';
import { supabase } from '@src/data/supabase';
import { UserView } from '@src/features/account/UserView';
import { useAuth } from '@src/providers/AuthProvider';

const Profile = () => {
  const auth = useAuth();

  if (!auth.user) {
    return null;
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
