import { useState } from 'react';
import Link from 'next/link';
import { pages } from '@next/pages';
import { Slot } from '@radix-ui/react-slot';
import toast from 'react-hot-toast';
import { Popover } from '@src/components/Popover';
import { supabase } from '@src/data/supabase';
import { AuthUser } from '@src/providers/AuthProvider';
import styles from './userAuthState.module.scss';

interface UserDropdownProps {
  user: AuthUser;
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Logs the user out.
   */
  const logOut = async () => {
    setIsOpen(false);
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={open => setIsOpen(open)}>
      <Popover.Trigger as={Slot}>
        <button className={styles.trigger}>
          <span className="sr-only">View profile and more</span>
          <span className={styles.avatar} />
          <span className={styles.triggerChevron} />
        </button>
      </Popover.Trigger>

      <Popover.Content
        className={styles.userPopover}
        side="bottom"
        align="end"
        aria-label="Profile">
        <Popover.Body className={styles.userPopoverInfo}>
          <p className={styles.userPopoverTitle} id="user-dropdown-title">
            <span className={styles.userPopoverTitleLabel}>Logged in as</span>{' '}
            <span>{user.email.split('@')[0]}</span>
          </p>
        </Popover.Body>
        <Popover.Body className={styles.userPopoverLinks}>
          <ul>
            <li className={styles.userPopoverLinksItem}>
              <Link passHref href={pages.museum(user.museumId).index}>
                <a className={styles.userPopoverLink} onClick={() => setIsOpen(false)}>
                  Myseum
                </a>
              </Link>
            </li>
            <li className={styles.userPopoverLinksItem}>
              <Link passHref href={pages.me}>
                <a className={styles.userPopoverLink} onClick={() => setIsOpen(false)}>
                  Profile
                </a>
              </Link>
            </li>
            <li className={styles.userPopoverLinksItem}>
              <button
                className={styles.userPopoverLink}
                disabled={isLoading}
                onClick={() => logOut()}>
                Log out
              </button>
            </li>
          </ul>
        </Popover.Body>
      </Popover.Content>
    </Popover.Root>
  );
};
