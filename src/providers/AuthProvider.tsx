import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/supabase-auth-helpers/react';
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

  const [serverSupabaseUser, setServerSupabaseUser] = useState(initValue);
  const { user: clientSupabaseUser, isLoading } = useUser();
  const supabaseUser = clientSupabaseUser ?? serverSupabaseUser;

  // Clear server data when client data is loaded
  useEffect(() => {
    if (clientSupabaseUser) {
      setServerSupabaseUser(null);
    }
  }, [!!clientSupabaseUser]);

  const [userData, setUserData] = useState<UserDto | null>(initValue ?? null);
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
    if (supabaseUser) {
      // Update user later with extra data
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      updateUserData(supabaseUser, abortController.signal);
    } else {
      setUserData(null);
    }

    api.auth.onStateChange(event => {
      if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });
  }, [supabaseUser]);

  /**
   * Signs in the user via Google OAuth.
   */
  async function signIn() {
    const url = new URL(`${window.location.origin}/callback`);
    window.localStorage.setItem('returnTo', router.asPath);
    await api.auth.signIn({ redirectTo: url.toString() });
  }

  /**
   * Signs the user out.
   */
  async function signOut() {
    await api.auth.signOut();
  }

  let user: AuthUserDto | null = null;
  if (supabaseUser && userData) {
    user = {
      ...supabaseUser,
      ...userData,
      // Registration is thru Google OAuth, so email guaranteed!
      email: supabaseUser.email as string,
    };
  }

  return (
    <AuthContext.Provider
      value={{
        isUserLoading: isLoading,
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
