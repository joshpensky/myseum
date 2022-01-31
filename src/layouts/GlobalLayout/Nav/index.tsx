import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import cx from 'classnames';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import { supabase } from '@src/data/supabase';
import { useAuth } from '@src/providers/AuthProvider';
import Logo from '@src/svgs/Logo';
import { UserDropdown } from './UserDropdown';
import styles from './nav.module.scss';

const Nav = () => {
  const auth = useAuth();
  const router = useRouter();

  const [isSigningIn, setIsSigningIn] = useState(false);

  /**
   * Signs in the user via Google OAuth.
   */
  const signIn = async () => {
    setIsSigningIn(true);
    const { error } = await supabase.auth.signIn(
      { provider: 'google' },
      {
        redirectTo: `${window.location.origin}${router.asPath}`,
      },
    );
    if (error) {
      toast.error(error.message);
      setIsSigningIn(false);
    }
  };

  return (
    <nav id="nav" className={cx(styles.root)}>
      <Link passHref href="/">
        <a className={styles.navLogo}>
          <Logo />
        </a>
      </Link>

      {auth.user || auth.isUserLoading ? (
        <UserDropdown />
      ) : (
        <Button disabled={isSigningIn} onClick={() => signIn()}>
          Sign in
        </Button>
      )}
    </nav>
  );
};

export default Nav;
