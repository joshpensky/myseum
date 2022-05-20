import { useState } from 'react';
import { ApiError } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import { SEO } from '@src/components/SEO';
import { useAuth } from '@src/providers/AuthProvider';
import { MyseumIconIllustration } from '@src/svgs/illustrations/MyseumIconIllustration';
import styles from './home.module.scss';

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
    <div className={styles.page}>
      <SEO title="Myseum" />

      <div className={styles.illo}>
        <MyseumIconIllustration />
      </div>

      <h1 className={styles.title}>Myseum</h1>

      <p className={styles.desc}>Build your own museum.</p>

      <Button busy={isSigningIn} onClick={() => signIn()}>
        Sign in
      </Button>
    </div>
  );
};
