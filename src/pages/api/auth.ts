import { NextApiHandler } from 'next';
import { supabase } from '@src/data/supabase';

const authController: NextApiHandler = (req, res) => {
  // Assigns the user's Supabase auth token as a cookie
  supabase.auth.api.setAuthCookie(req, res);
};

export default authController;
