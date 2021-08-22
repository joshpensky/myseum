import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { pages } from 'next-pages-gen';
import toast from 'react-hot-toast';
import { UserDto } from '@src/data/UserSerializer';
import { supabase } from '@src/data/supabase';

export interface AuthUser extends SupabaseUser, UserDto {
  email: string;
}

interface AuthContextValue {
  didLogOut: boolean;
  user: AuthUser | null;
}

export const AuthContext = createContext<AuthContextValue>({
  didLogOut: false,
  user: null,
});

type AuthProviderProps = Record<never, string>;
export const AuthProvider = ({ children }: PropsWithChildren<AuthProviderProps>) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [didLogOut, setDidLogOut] = useState(false);

  const router = useRouter();

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Updates the current user state from Supabase public data,
   * with an option to abort via an abort controller.
   *
   * @param authUser the Supabase-authenticated user
   * @returns the update promise and an abort controller to cancel the update
   */
  const updateUser = (authUser: SupabaseUser): [AbortController, Promise<void>] => {
    const abortController = new AbortController();
    const updatePromise = (async () => {
      const res = await fetch(pages.api.user(authUser.id).index);
      if (res.status === 404) {
        // Sign out of user not found
        await supabase.auth.signOut();
      } else if (!res.ok) {
        // Show error if user could not be fetched
        toast.error('Could not fetch user data.');
      } else if (!abortController.signal.aborted) {
        // Otherwise, update user data if not aborted
        const user = (await res.json()) as UserDto;
        setUser({
          ...authUser,
          ...user,
          email: authUser.email as string,
        });
      }
    })();
    return [abortController, updatePromise];
  };

  /**
   * Handler for Supabase auth state changes. Controls updating the user, setting
   * the auth cookie header, and spawning toasts.
   *
   * @param event the state change event
   * @param session the affected auth session
   */
  const onAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
    // Abort any ongoing abort controllers on login-state change
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      abortControllerRef.current?.abort();
    }

    // Update auth state
    if (session?.user) {
      // Update user immediately
      setUser(oldUser => {
        if (oldUser) {
          return { ...oldUser, ...session.user };
        }
        return null;
      });
      // Then update user later with extra data
      const [changeAbortController, updatePromise] = updateUser(session?.user);
      abortControllerRef.current = changeAbortController;
      await updatePromise;
    } else {
      setUser(null);
    }

    // Update SSR cookie on auth state change
    fetch(pages.api.auth, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      credentials: 'same-origin',
      body: JSON.stringify({ event, session }),
    });

    // Send success toast when logging in or out
    if (event === 'SIGNED_IN') {
      toast.success('Logged in!'); // TODO: prevent toast on refresh token (which also triggers SIGNED_IN event)
      setDidLogOut(false);
    } else if (event === 'SIGNED_OUT') {
      setDidLogOut(true);
      toast.success('Logged out!');
    }
  };

  // Manages Supabase auth state
  useEffect(() => {
    // Get initial auth state
    const user = supabase.auth.user();

    if (user) {
      // Update user immediately
      setUser(user as AuthUser);
      // Update user later with extra data
      const [rootAbortController] = updateUser(user);
      abortControllerRef.current = rootAbortController;
    } else {
      setUser(null);
    }

    // Listen to auth changes
    const { data: authSubscription } = supabase.auth.onAuthStateChange(onAuthStateChange);

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  // Fix bug with auth leaving an empty '#' after authentication
  useEffect(() => {
    const { data: authSubscription } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN') {
        const splitPath = router.asPath.split('#');
        if (splitPath[1] === '' || splitPath[1].startsWith('access_token')) {
          router.replace(splitPath[0], undefined, { shallow: true });
        }
      }
    });

    return () => {
      authSubscription?.unsubscribe();
    };
  }, [router.asPath]);

  // Listens and updates user when Supabase record updates
  useEffect(() => {
    if (user) {
      // Listener to user updates
      const userSubscription = supabase
        .from(`users:id=eq.${user.id}`)
        .on('UPDATE', payload => {
          setUser(user => ({
            ...user,
            ...payload.new,
          }));
        })
        .on('DELETE', () => {
          supabase.auth.signOut();
        })
        .subscribe();

      return () => {
        userSubscription.unsubscribe();
      };
    }
  }, [user?.id]);

  return <AuthContext.Provider value={{ didLogOut, user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
