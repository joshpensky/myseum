import { NextApiHandler } from 'next';
import { UserRepository } from '@src/data/repositories/user.repository';
import { UserSerializer } from '@src/data/serializers/user.serializer';
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
        res.status(200).json(UserSerializer.serialize(user));
        break;
      }

      // Updates the chosen user
      case 'PUT': {
        const auth = await supabase.auth.api.getUserByCookie(req);
        // Only allow users to update themselves
        if (!auth.user || auth.user.id !== userId) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        const user = await UserRepository.update(auth.user, req.body);
        res.status(200).json(UserSerializer.serialize(user));
        break;
      }

      case 'DELETE': {
        const auth = await supabase.auth.api.getUserByCookie(req);
        // Only allow users to update themselves
        if (!auth.user || auth.user.id !== userId) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        const { error } = await supabase.auth.api.deleteUser(auth.user.id);
        if (error) {
          throw error;
        }
        res.status(204).json({ success: true });
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default userDetailController;
