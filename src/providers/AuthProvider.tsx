import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { supabase } from '@src/data/supabase';

export interface AuthUser extends User {
  email: string;
  bio: string | null;
  avatar: string | null;
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

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Updates the current user state from Supabase public data,
   * with an option to abort via an abort controller.
   *
   * @param authUser the Supabase-authenticated user
   * @returns the update promise and an abort controller to cancel the update
   */
  const updateUser = (authUser: User): [AbortController, Promise<void>] => {
    const abortController = new AbortController();
    const updatePromise = (async () => {
      const { data: user } = await supabase.from('users').select().eq('id', authUser.id).single();
      if (!abortController.signal.aborted) {
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
    fetch('/api/auth', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      credentials: 'same-origin',
      body: JSON.stringify({ event, session }),
    });

    // Send success toast when logging in or out
    if (event === 'SIGNED_IN') {
      toast.success('Logged in!'); // TODO: prevent toast on refresh token
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
        .subscribe();

      return () => {
        userSubscription.unsubscribe();
      };
    }
  }, [user?.id]);

  return <AuthContext.Provider value={{ didLogOut, user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
