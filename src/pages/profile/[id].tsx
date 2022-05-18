import { GetServerSideProps } from 'next';
import * as z from 'zod';
import api from '@src/api';
import { UserView, UserViewProps } from '@src/features/profile/UserView';

export default UserView;

export const getServerSideProps: GetServerSideProps<UserViewProps> = async ctx => {
  const userId = z.string().safeParse(ctx.params?.id);
  if (!userId.success) {
    return {
      notFound: true,
    };
  }

  const authUser = await api.auth.findUserByCookie(ctx);
  if (authUser?.id === userId.data) {
    return {
      props: {
        // __supabaseUser
        __userData: authUser,
        user: authUser,
      },
    };
  }

  const user = await api.user.findOneById(userId.data);
  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      // __supabaseUser
      __userData: authUser,
      user,
    },
  };
};
