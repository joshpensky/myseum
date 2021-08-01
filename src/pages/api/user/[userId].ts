import { NextApiHandler } from 'next';
import { UserRepository } from '@src/data/UserRepository';
import { supabase } from '@src/data/supabase';

const userDetailController: NextApiHandler = async (req, res) => {
  const userId = req.query.userId;
  if (typeof userId !== 'string') {
    res.status(400).json({ message: 'Must supply a single user ID' });
    return;
  }

  try {
    switch (req.method) {
      // Gets the chosen user
      case 'GET': {
        const user = await UserRepository.findOne(userId);
        if (!user) {
          res.status(404).json({ message: 'User not found.' });
          return;
        }
        res.status(200).json(user);
        break;
      }

      // Updates the chosen user
      case 'PATCH': {
        const auth = await supabase.auth.api.getUserByCookie(req);
        // Only allow users to update themselves
        if (!auth.user || auth.user.id !== userId) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        const user = await UserRepository.update(auth.user, req.body);
        res.status(200).json(user);
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'GET, PATCH');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default userDetailController;
