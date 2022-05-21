import { NextApiHandler } from 'next';
import { ArtistRepository } from '@src/data/repositories/artist.repository';
import { ArtistSerializer } from '@src/data/serializers/artist.serializer';
import { supabase } from '@src/data/supabase';

const artistIndexController: NextApiHandler = async (req, res) => {
  // Protect endpoint for only authenticated users
  const auth = await supabase.auth.api.getUserByCookie(req);
  if (!auth.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  try {
    switch (req.method) {
      // Gets all artists
      case 'GET': {
        const artists = await ArtistRepository.findAll();
        const serializedArtists = artists.map(artist => ArtistSerializer.serialize(artist));
        res.status(200).json(serializedArtists);
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

export default artistIndexController;
