import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import { supabase } from '@src/data/supabase';
import { useAuth } from '@src/providers/AuthProvider';
import { UserDropdown } from './UserDropdown';

const UserAuthState = () => {
  const auth = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Logs the user in via Google OAuth.
   */
  const logIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signIn(
      { provider: 'google' },
      {
        redirectTo: `${window.location.origin}${router.asPath}`,
      },
    );
    if (error) {
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  if (!auth.user) {
    return (
      <Button disabled={isLoading} onClick={() => logIn()}>
        Log in
      </Button>
    );
  }

  return <UserDropdown user={auth.user} />;
};

export default UserAuthState;
