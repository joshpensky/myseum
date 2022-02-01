import { useState } from 'react';
import { ApiError } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import { useAuth } from '@src/providers/AuthProvider';

export const AnonymousHome = () => {
  const auth = useAuth();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = async () => {
    setIsSigningIn(true);
    try {
      await auth.signIn();
    } catch (error) {
      toast.error((error as ApiError).message);
      setIsSigningIn(false);
    }
  };

  return (
    <div>
      <h1>Home</h1>

      <Button busy={isSigningIn} onClick={() => signIn()}>
        Sign in
      </Button>
    </div>
  );
};
