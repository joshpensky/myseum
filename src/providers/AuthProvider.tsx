import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { User as SupabaseUser } from '@supabase/supabase-js';
import axios from 'axios';
import toast from 'react-hot-toast';
import api from '@src/api';
import { UserDto } from '@src/data/serializers/user.serializer';

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
  initValue?: AuthUserDto | null;
}

export const AuthProvider = ({ children, initValue }: PropsWithChildren<AuthProviderProps>) => {
  const router = useRouter();

  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(initValue ?? null);
  const [userData, setUserData] = useState<UserDto | null>(initValue ?? null);

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
    alert(url);
    await api.auth.signIn({ redirectTo: url.toString() });
  }

  async function signOut() {
    await api.auth.signOut();
  }

  async function updateUserData(user: SupabaseUser, signal: AbortSignal) {
    try {
      const userDto = await api.user.findOneById(user.id, { signal });
      if (!signal.aborted) {
        // Update user data if not aborted
        setUserData(userDto);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Sign out of user not found
        await api.auth.signOut();
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

    const initUser = api.auth.getCurrentUser();

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
    const authSubscription = api.auth.onStateChange(async function onAuthStateChange(event, user) {
      // Abort any ongoing abort controllers on login-state change
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        abortControllerRef.current?.abort();
      }

      // Update auth state
      if (user) {
        setSupabaseUser(user);
        // Then update user later with extra data
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        await updateUserData(user, abortController.signal);
      } else {
        setSupabaseUser(null);
        setUserData(null);
      }

      // Redirect user to homepage on sign out
      if (event === 'SIGNED_IN') {
        toast.success('Signed in!');
      } else if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    return () => {
      authSubscription?.unsubscribe();
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
