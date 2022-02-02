import { GetServerSideProps } from 'next';
import * as z from 'zod';
import { UserRepository } from '@src/data/repositories/user.repository';
import { UserDto, UserSerializer } from '@src/data/serializers/user.serializer';
import { supabase } from '@src/data/supabase';
import { UserView, UserViewProps } from '@src/features/account/UserView';

export default UserView;

export const getServerSideProps: GetServerSideProps<UserViewProps> = async ctx => {
  const supabaseUser = await supabase.auth.api.getUserByCookie(ctx.req);

  const userId = z.string().safeParse(ctx.params?.id);
  if (!userId.success) {
    return {
      notFound: true,
    };
  }

  const user = await UserRepository.findOne(userId.data);
  if (!user) {
    return {
      notFound: true,
    };
  }
  const serializedUser = UserSerializer.serialize(user);

  let currentUserData: UserDto | null = null;
  if (user.id === supabaseUser.user?.id) {
    currentUserData = serializedUser;
  } else if (supabaseUser.user) {
    const currentUser = await UserRepository.findOne(supabaseUser.user);
    currentUserData = UserSerializer.serialize(currentUser);
  }

  return {
    props: {
      __supabaseUser: supabaseUser.user,
      __userData: currentUserData,
      user: serializedUser,
    },
  };
};
