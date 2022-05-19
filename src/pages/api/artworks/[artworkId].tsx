import { NextApiHandler } from 'next';
import { ArtworkRepository } from '@src/data/repositories/artwork.repository';
import { ArtworkSerializer } from '@src/data/serializers/artwork.serializer';

const artworkDetailController: NextApiHandler = async (req, res) => {
  const artworkId = req.query.artworkId;
  if (typeof artworkId !== 'string') {
    res.status(400).json({ message: 'Must supply a single artwork ID' });
    return;
  }

  try {
    switch (req.method) {
      case 'PUT': {
        const artwork = await ArtworkRepository.findOne(artworkId);
        if (!artwork) {
          res.status(404).json({ message: 'Artwork not found.' });
          return;
        }
        const updatedArtwork = await ArtworkRepository.update(artwork.id, req.body);
        res.status(200).json(ArtworkSerializer.serialize(updatedArtwork));
        break;
      }

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
        res.setHeader('Allow', 'PUT, DELETE');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default artworkDetailController;
