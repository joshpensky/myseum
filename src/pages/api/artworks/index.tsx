import { NextApiHandler } from 'next';
import { ArtworkRepository } from '@src/data/ArtworkRepository';

const artworkIndexController: NextApiHandler = async (req, res) => {
  try {
    switch (req.method) {
      // Gets all artworks
      case 'GET': {
        const artworks = await ArtworkRepository.findAll();
        res.status(200).json(artworks);
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default artworkIndexController;
