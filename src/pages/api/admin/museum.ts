import { NextApiHandler } from 'next';
import { getUser } from '@supabase/supabase-auth-helpers/nextjs';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { UserRepository } from '@src/data/repositories/user.repository';
import { MuseumSerializer } from '@src/data/serializers/museum.serializer';

const adminMuseumController: NextApiHandler = async (req, res) => {
  // Protect endpoint for only authenticated, admin users
  const auth = await getUser({ req, res });
  if (!auth.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  const user = await UserRepository.findOne(auth.user);
  if (!user.isAdmin) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  try {
    switch (req.method) {
      // Updates the museum with the given ID
      case 'GET': {
        const museums = await MuseumRepository.findAll();
        res.status(200).json(museums.map(museum => MuseumSerializer.serialize(museum)));
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

export default adminMuseumController;
