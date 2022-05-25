import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader } from '@src/components/Loader';
import { SEO } from '@src/components/SEO';
import { useAuth } from '@src/providers/AuthProvider';
import styles from './_styles/callback.module.scss';

const Callback = () => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.user) {
      const returnTo = window.localStorage.getItem('returnTo') ?? '/';
      window.localStorage.removeItem('returnTo');
      returnTo.replace('#', '');

      router.replace(returnTo);
    }
  }, [auth.user]);

  return (
    <div className={styles.wrapper}>
      <SEO title="Redirecting..." />

      <h1 className="sr-only">Redirecting...</h1>

      <Loader size="large" />
    </div>
  );
};

export default Callback;
