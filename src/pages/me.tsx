import { FormEvent, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import tw from 'twin.macro';
import { Profile } from '@prisma/client';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import TextField from '@src/components/TextField';
import { supabase } from '@src/lib/supabase';
import { AuthUser, useAuth } from '@src/providers/AuthProvider';
import { getProfile } from './api/profiles/[id]';

interface ProfileProps {
  profile: Profile | null;
  user: AuthUser;
}

const ProfilePage = ({ profile, user }: ProfileProps) => {
  const auth = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState(profile?.bio ?? '');

  const [state, setState] = useState<'idle' | 'loading'>('idle');

  const onSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    try {
      setState('loading');
      const res = await fetch(`/api/profiles/${user.id}`, {
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ bio }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw error;
      }
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setState('idle');
    }
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

        <label htmlFor="bio">Biography</label>
        <TextField
          id="bio"
          type="text"
          grow
          rows={3}
          disabled={state === 'loading'}
          value={bio}
          onChange={setBio}
        />

        <Button type="submit" disabled={state === 'loading'}>
          Update
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;

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

  const profile = await getProfile(auth.user.id);

  // Otherwise, continue onward!
  return {
    props: {
      user: auth.user as AuthUser,
      profile,
    },
  };
};
