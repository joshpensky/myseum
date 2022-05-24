import { NextApiHandler } from 'next';
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs';
import { UserRepository } from '@src/data/repositories/user.repository';
import { UserSerializer } from '@src/data/serializers/user.serializer';

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
        // Protect endpoint for only authenticated users
        const auth = await supabaseServerClient({ req, res }).auth.api.getUserByCookie(req);
        if (!auth.user) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        // Only allow users to update themselves
        if (auth.user.id !== userId) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        const user = await UserRepository.update(auth.user, req.body);
        res.status(200).json(UserSerializer.serialize(user));
        break;
      }

      case 'DELETE': {
        // Protect endpoint for only authenticated users
        const auth = await supabaseServerClient({ req, res }).auth.api.getUserByCookie(req);
        if (!auth.user) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        // Only allow users to delete themselves
        if (auth.user.id !== userId) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        const { error } = await supabaseServerClient({ req, res }).auth.api.deleteUser(
          auth.user.id,
        );
        if (error) {
          throw error;
        }
        res.status(204).json({ success: true });
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'GET, PUT, DELETE');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default userDetailController;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
