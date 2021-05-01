import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { supabase } from '@src/utils/supabase';

export interface AuthUser extends User {
  email: string;
}

interface AuthContextValue {
  didLogOut: boolean;
  session: Session | null;
  user: AuthUser | null;
}

export const AuthContext = createContext<AuthContextValue>({
  didLogOut: false,
  session: null,
  user: null,
});

type AuthProviderProps = Record<never, string>;
export const AuthProvider = ({ children }: PropsWithChildren<AuthProviderProps>) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [didLogOut, setDidLogOut] = useState(false);

  useEffect(() => {
    // Get initial auth state
    const session = supabase.auth.session();
    setSession(session);
    setUser((session?.user as AuthUser) ?? null);

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Update auth state
      setSession(session);
      setUser((session?.user as AuthUser) ?? null);
      setDidLogOut(event === 'SIGNED_OUT');

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
      } else if (event === 'SIGNED_OUT') {
        toast.success('Logged out!');
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ didLogOut, session, user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
