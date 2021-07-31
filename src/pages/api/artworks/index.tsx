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

      // Otherwise, throw 404
      default: {
        res.status(404).json({ message: 'Not found.' });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default artworkIndexController;
