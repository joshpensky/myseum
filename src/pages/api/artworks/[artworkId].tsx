import { NextApiHandler } from 'next';
import { ArtworkRepository } from '@src/data/repositories/artwork.repository';

const artworkDetailController: NextApiHandler = async (req, res) => {
  const artworkId = req.query.artworkId;
  if (typeof artworkId !== 'string') {
    res.status(400).json({ message: 'Must supply a single artwork ID' });
    return;
  }

  try {
    switch (req.method) {
      case 'DELETE': {
        const artwork = await ArtworkRepository.findOne(artworkId);
        if (!artwork) {
          res.status(404).json({ message: 'Artwork not found.' });
          return;
        }
        ArtworkRepository.delete(artwork);
        res.status(204).json({ success: true });
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'DELETE');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default artworkDetailController;
