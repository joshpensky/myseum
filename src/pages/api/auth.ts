import { NextApiHandler } from 'next';
import { supabase } from '@src/utils/supabase';

const auth: NextApiHandler = (req, res) => {
  // Assigns the user's Supabase auth token as a cookie
  supabase.auth.api.setAuthCookie(req, res);
};

export default auth;
