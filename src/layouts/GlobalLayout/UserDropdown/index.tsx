import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ApiError } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Loader } from '@src/components/Loader';
import { Popover } from '@src/components/Popover';
import { useAuth } from '@src/providers/AuthProvider';
import { getImageUrl } from '@src/utils/getImageUrl';
import styles from './userDropdown.module.scss';

export const UserDropdown = () => {
  const auth = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  /**
   * Signs the user out.
   */
  const signOut = async () => {
    if (!isSigningOut) {
      setIsSigningOut(true);
      try {
        await auth.signOut();
        toast.success('Signed out!');
      } catch (error) {
        toast.error((error as ApiError).message);
        setIsSigningOut(false);
      }
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={open => setIsOpen(open)}>
      <Popover.Trigger asChild>
        <button className={styles.trigger}>
          <span className="sr-only">View profile and more</span>
          <span className={styles.headshot}>
            {auth.user?.headshot && (
              <Image src={getImageUrl('headshots', auth.user.headshot)} alt="" layout="fill" />
            )}
          </span>
          <span className={styles.triggerChevron} />
        </button>
      </Popover.Trigger>

      {auth.user && (
        <Popover.Content
          className={styles.userPopover}
          side="bottom"
          align="end"
          aria-label="Profile">
          <p className={styles.userPopoverTitle} id="user-dropdown-title">
            <span className={styles.userPopoverTitleLabel}>Signed in as</span>{' '}
            <span>{auth.user.name}</span>
          </p>

          <hr className={styles.separator} />

          <ul className={styles.userPopoverLinks}>
            <li className={styles.userPopoverLinksItem}>
              <Link href="/">
                <a className={styles.userPopoverLink} onClick={() => setIsOpen(false)}>
                  Myseum
                </a>
              </Link>
            </li>
            <li className={styles.userPopoverLinksItem}>
              <Link href="/me">
                <a className={styles.userPopoverLink} onClick={() => setIsOpen(false)}>
                  Profile
                </a>
              </Link>
            </li>
            {auth.user.isAdmin && (
              <li className={styles.userPopoverLinksItem}>
                <Link href="/admin">
                  <a className={styles.userPopoverLink} onClick={() => setIsOpen(false)}>
                    Admin
                  </a>
                </Link>
              </li>
            )}
            <li className={styles.userPopoverLinksItem}>
              <button
                className={styles.userPopoverLink}
                aria-busy={isSigningOut}
                onClick={() => signOut()}>
                Sign out
                {isSigningOut && <Loader className={styles.loader} />}
              </button>
            </li>
          </ul>
        </Popover.Content>
      )}
    </Popover.Root>
  );
};
