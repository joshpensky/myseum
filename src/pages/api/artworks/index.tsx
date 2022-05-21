import { NextApiHandler } from 'next';
import { ArtworkRepository } from '@src/data/repositories/artwork.repository';
import { ArtworkSerializer } from '@src/data/serializers/artwork.serializer';
import { supabase } from '@src/data/supabase';

const artworkIndexController: NextApiHandler = async (req, res) => {
  // Protect endpoint for only authenticated users
  const auth = await supabase.auth.api.getUserByCookie(req);
  if (!auth.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  try {
    switch (req.method) {
      // Creates new artwork
      case 'POST': {
        const auth = await supabase.auth.api.getUserByCookie(req);
        if (!auth.user) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        const artwork = await ArtworkRepository.create({ ...req.body, ownerId: auth.user.id });
        res.status(200).json(ArtworkSerializer.serialize(artwork));
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default artworkIndexController;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
