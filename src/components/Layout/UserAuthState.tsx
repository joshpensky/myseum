import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import tw from 'twin.macro';
import FocusLock from 'react-focus-lock';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import { AuthUser, useAuth } from '@src/providers/AuthProvider';
import { supabase } from '@src/utils/supabase';

interface UserDropdownProps {
  user: AuthUser;
}
const UserDropdown = ({ user }: UserDropdownProps) => {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Logs the user out.
   */
  const logOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    }
    setIsLoading(false);
    setIsDropdownOpen(false);
  };

  /**
   * Closes the dropdown when clicked outside.
   */
  const onOutsideClick = (evt: MouseEvent) => {
    if (
      dropdownRef.current &&
      evt.target &&
      evt.target instanceof Node &&
      !(dropdownRef.current === evt.target || dropdownRef.current.contains(evt.target))
    ) {
      setIsDropdownOpen(false);
    }
  };

  /**
   * Closes the dropdown when escape key is pressed.
   */
  const onEscapeKey = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Esc':
      case 'Escape': {
        evt.preventDefault();
        setIsDropdownOpen(false);
        toggleRef.current?.focus();
        break;
      }
    }
  };

  // Attaches escape key and outside click listeners when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      window.addEventListener('keydown', onEscapeKey);
      window.addEventListener('click', onOutsideClick);

      return () => {
        window.removeEventListener('keydown', onEscapeKey);
        window.removeEventListener('click', onOutsideClick);
      };
    }
  }, [isDropdownOpen]);

  return (
    <div className="no-replace" css={[tw`relative`]}>
      <button
        ref={toggleRef}
        className="group"
        css={[tw`flex items-center`, tw`focus:outline-none`]}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-haspopup="dialog"
        aria-expanded={isDropdownOpen}
        aria-controls={isDropdownOpen ? 'user-dropdown' : undefined}>
        <div
          css={[
            tw`h-9 w-6 mr-1.5 flex-shrink-0 bg-gray-300 borderRadius[100%]`,
            isDropdownOpen ? tw`ring-1` : tw`ring-0`,
            tw`ring-black ring-opacity-80 transition-shadow group-focus:ring-1`,
          ]}
        />
        <div
          css={[
            tw`size-0 text-black text-opacity-80 border-4 border-transparent border-t-current transform transition-transform`,
            isDropdownOpen ? tw`--tw-scale-y[-1]` : tw`translate-y-1/2`,
          ]}
        />
      </button>

      <FocusLock disabled={!isDropdownOpen}>
        <div
          ref={dropdownRef}
          id="user-dropdown"
          css={[
            tw`absolute -bottom-3 right-0 transform translate-y-full`,
            tw`flex flex-col items-start minWidth[12rem]`,
            tw`text-black text-opacity-20 bg-current ring-current shadow-popover rounded-md`,
            tw`origin-top-right transition-modal-enter`,
            !isDropdownOpen &&
              tw`invisible opacity-0 scale-95 pointer-events-none transition-modal-leave`,
          ]}
          role="dialog"
          aria-labelledby="user-dropdown-title">
          <div css={[tw`py-2 px-3 text-black bg-white rounded-t-md mb-px w-full`]}>
            <p id="user-dropdown-title" css={[tw`pr-3 flex flex-col`]}>
              <span css={[tw`text-sm -mb-0.5`]}>Logged in as</span>{' '}
              <span>{user.email.split('@')[0]}</span>
            </p>
          </div>
          <ul css={[tw`py-1.5 px-1 text-black bg-white rounded-b-md flex flex-col w-full`]}>
            <li css={[tw`not-last:mb-0.5`]}>
              <Link passHref href="/me">
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/interactive-supports-focus */}
                <a
                  css={[
                    tw`py-0.5 px-2 rounded flex w-full`,
                    tw`transition-colors hover:bg-gray-100 focus:(outline-none bg-gray-200)`,
                  ]}
                  onClick={() => setIsDropdownOpen(false)}>
                  Profile
                </a>
              </Link>
            </li>
            <li css={[tw`not-last:mb-0.5`]}>
              <button
                css={[
                  tw`py-0.5 px-2 rounded flex w-full`,
                  tw`transition-colors hover:bg-gray-100 focus:(outline-none bg-gray-200)`,
                ]}
                disabled={isLoading}
                onClick={() => logOut()}>
                Log out
              </button>
            </li>
          </ul>
        </div>
      </FocusLock>
    </div>
  );
};

const UserAuthState = () => {
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Logs the user in via Google OAuth.
   */
  const logIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signIn({ provider: 'google' });
    if (error) {
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  if (!auth.user) {
    return (
      <Button className="no-replace" disabled={isLoading} onClick={() => logIn()}>
        Log in
      </Button>
    );
  }

  return <UserDropdown user={auth.user} />;
};

export default UserAuthState;
