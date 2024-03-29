import { GetServerSideProps } from 'next';
import { withPageAuth } from '@supabase/supabase-auth-helpers/nextjs';
import * as z from 'zod';
import api from '@src/api/server';
import { UserView, UserViewProps } from '@src/features/profile/UserView';

export default UserView;

export const getServerSideProps: GetServerSideProps<UserViewProps> = withPageAuth({
  async getServerSideProps(ctx) {
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
          __authUser: authUser,
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
        __authUser: authUser,
        user,
      },
    };
  },
});
