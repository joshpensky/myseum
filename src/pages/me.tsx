import { FormEvent, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import tw from 'twin.macro';
import Button from '@src/components/Button';
import TextField from '@src/components/TextField';
import { AuthUser, useAuth } from '@src/providers/AuthProvider';
import { supabase } from '@src/utils/supabase';

interface ProfileProps {
  user: AuthUser;
}

const Profile = ({ user }: ProfileProps) => {
  const auth = useAuth();
  const router = useRouter();

  const onSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
  };

  // Client-side redirect if user logs out
  useEffect(() => {
    if (auth.didLogOut) {
      router.replace('/');
    }
  }, [auth.didLogOut]);

  return (
    <div>
      <Head>
        <title>Profile</title>
      </Head>

      <h1 css={[tw`font-serif text-4xl`]}>Profile</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email address</label>
        <TextField
          id="email"
          type="email"
          readOnly
          disabled
          value={user.email}
          onChange={() => {}}
          required
          aria-describedby="email-helptext"
        />
        <p id="email-helptext" css={[tw`text-sm`]}>
          Authenticated via Google
        </p>

        <Button type="submit">Update</Button>
      </form>
    </div>
  );
};

export default Profile;

// Protect route on navigation
export const getServerSideProps: GetServerSideProps<ProfileProps> = async ctx => {
  const auth = await supabase.auth.api.getUserByCookie(ctx.req);

  // If user not logged in, redirect to homepage
  if (!auth.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Otherwise, continue onward!
  return {
    props: {
      user: auth.user as AuthUser,
    },
  };
};
