import { NextApiHandler } from 'next';

const notFoundController: NextApiHandler = (req, res) => {
  // Assigns the user's Supabase auth token as a cookie
  res.status(404).json({
    code: 'not_found',
    message: 'Endpoint not found.',
  });
};

export default notFoundController;
