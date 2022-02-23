import { NextApiHandler } from 'next';
import { ArtworkRepository } from '@src/data/repositories/artwork.repository';
import { ArtworkSerializer } from '@src/data/serializers/artwork.serializer';
import { supabase } from '@src/data/supabase';

const userDetailController: NextApiHandler = async (req, res) => {
  try {
    switch (req.method) {
      // Gets the chosen user
      case 'GET': {
        const auth = await supabase.auth.api.getUserByCookie(req);
        // Only allow users to update themselves
        if (!auth.user) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        const artworks = await ArtworkRepository.findAllByUser(auth.user.id);
        const serializedArtworks = artworks.map(artwork => ArtworkSerializer.serialize(artwork));
        res.status(200).json(serializedArtworks);
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
