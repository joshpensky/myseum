import { useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@supabase/supabase-js';
import cx from 'classnames';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import { useAuth } from '@src/providers/AuthProvider';
import Logo from '@src/svgs/Logo';
import { UserDropdown } from './UserDropdown';
import styles from './nav.module.scss';

const Nav = () => {
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
