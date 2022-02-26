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
      let destination: string;
      if (!router.query.returnTo) {
        destination = '/';
      } else if (Array.isArray(router.query.returnTo)) {
        destination = router.query.returnTo[0];
      } else {
        destination = router.query.returnTo;
      }
      destination.replace('#', '');

      router.replace(destination);
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
