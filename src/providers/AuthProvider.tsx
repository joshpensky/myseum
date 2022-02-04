import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserDto } from '@src/data/serializers/user.serializer';
import { supabase } from '@src/data/supabase';

export interface AuthUserDto extends SupabaseUser, UserDto {
  email: string;
}

interface AuthContextValue {
  isUserLoading: boolean;
  user: AuthUserDto | null;
  updateUserData(data: UserDto): void;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  isUserLoading: false,
  user: null,
  updateUserData: () => {},
  signIn: async () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  initValue: {
    supabaseUser: SupabaseUser | null;
    userData: UserDto | null;
  };
}

export const AuthProvider = ({ children, initValue }: PropsWithChildren<AuthProviderProps>) => {
  const router = useRouter();

  const [supabaseUser, setSupabaseUser] = useState(initValue.supabaseUser);
  const [userData, setUserData] = useState(initValue.userData);

  // Flag for if the user is logged in, but their data is still loading!
  const isUserLoading = !!supabaseUser && !userData;

  let user: AuthUserDto | null = null;
  if (supabaseUser && userData) {
    user = {
      ...supabaseUser,
      ...userData,
      // Registration is thru Google OAuth, so email guaranteed!
      email: supabaseUser.email as string,
    };
  }

  /**
   * Signs in the user via Google OAuth.
   */
  async function signIn() {
    const url = new URL(`${window.location.origin}/callback`);
    url.searchParams.append('returnTo', router.asPath);

    const { error } = await supabase.auth.signIn(
      { provider: 'google' },
      {
        redirectTo: url.toString(),
      },
    );
    if (error) {
      throw error;
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  async function updateUserData(user: SupabaseUser, signal: AbortSignal) {
    try {
      const res = await axios.get<UserDto>(`/api/user/${user.id}`, { signal });
      if (!signal.aborted) {
        // Update user data if not aborted
        setUserData(res.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Sign out of user not found
        await supabase.auth.signOut();
      } else if (!signal.aborted) {
        // Show error if user could not be fetched
        toast.error('Could not fetch user data.');
      }
    }
  }

  // Manages Supabase auth state
  const abortControllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    // Abort any ongoing abort controllers on mount
    abortControllerRef.current?.abort();

    const initUser = supabase.auth.user();

    if (initUser) {
      setSupabaseUser(initUser);
      // Update user later with extra data
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      updateUserData(initUser, abortController.signal);
    } else {
      setSupabaseUser(null);
      setUserData(null);
    }

    // Listen to auth changes
    const authSubscription = supabase.auth.onAuthStateChange(async function onAuthStateChange(
      event: AuthChangeEvent,
      session: Session | null,
    ) {
      // Abort any ongoing abort controllers on login-state change
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        abortControllerRef.current?.abort();
      }

      // Update auth state
      if (session?.user) {
        setSupabaseUser(session.user);
        // Then update user later with extra data
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        await updateUserData(session.user, abortController.signal);
      } else {
        setSupabaseUser(null);
        setUserData(null);
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

      // Redirect user to homepage on sign out
      if (event === 'SIGNED_IN') {
        toast.success('Signed in!');
      } else if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    return () => {
      authSubscription.data?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isUserLoading,
        user,
        signIn,
        signOut,
        updateUserData: setUserData,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
