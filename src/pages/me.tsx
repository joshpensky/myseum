import { FormEvent, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import tw from 'twin.macro';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import TextField from '@src/components/TextField';
import { UserRepository } from '@src/data/UserRepository';
import { supabase } from '@src/data/supabase';
import { AuthUser, useAuth } from '@src/providers/AuthProvider';

interface ProfileProps {
  user: AuthUser;
}

const Profile = ({ user }: ProfileProps) => {
  const auth = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState(user.bio ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    try {
      setIsSubmitting(true);

      const res = await fetch(`/api/user/${user.id}`, {
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
      // Regardless, reset form state
      setIsSubmitting(false);
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
          disabled={isSubmitting}
          value={bio}
          onChange={setBio}
        />

        <Button type="submit" disabled={isSubmitting}>
          Update
        </Button>
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

  const user = await UserRepository.findOne(auth.user);

  // Otherwise, continue onward!
  return {
    props: {
      user: JSON.parse(
        JSON.stringify({
          ...auth.user,
          ...user,
          email: auth.user.email as string,
        }),
      ),
    },
  };
};
