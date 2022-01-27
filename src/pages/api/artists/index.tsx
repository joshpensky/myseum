import { NextApiHandler } from 'next';
import { ArtistRepository } from '@src/data/ArtistRepository';
import { ArtistSerializer } from '@src/data/ArtistSerializer';

const artistIndexController: NextApiHandler = async (req, res) => {
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
