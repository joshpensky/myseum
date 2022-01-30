import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserDto } from '@src/data/UserSerializer';
import { supabase } from '@src/data/supabase';

export interface AuthUserDto extends SupabaseUser, UserDto {
  email: string;
}

interface AuthContextValue {
  didLogOut: boolean;
  isUserLoading: boolean;
  user: AuthUserDto | null;
}

export const AuthContext = createContext<AuthContextValue>({
  didLogOut: false,
  isUserLoading: false,
  user: null,
});

type AuthProviderProps = Record<never, string>;

export const AuthProvider = ({ children }: PropsWithChildren<AuthProviderProps>) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<UserDto | null>(null);

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
  const [didLogOut, setDidLogOut] = useState(false);
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

      // Send success toast when logging in or out
      if (event === 'SIGNED_IN') {
        toast.success('Logged in!');
        setDidLogOut(false);
      } else if (event === 'SIGNED_OUT') {
        setDidLogOut(true);
        toast.success('Logged out!');
      }
    });

    return () => {
      authSubscription.data?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ didLogOut, isUserLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
