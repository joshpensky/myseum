import { NextApiHandler } from 'next';
import { ArtworkRepository } from '@src/data/repositories/artwork.repository';
import { UserRepository } from '@src/data/repositories/user.repository';
import { ArtworkSerializer } from '@src/data/serializers/artwork.serializer';

const userArtworksController: NextApiHandler = async (req, res) => {
  const userId = req.query.userId;
  if (typeof userId !== 'string') {
    res.status(400).json({ message: 'Must supply a single user ID' });
    return;
  }

  try {
    switch (req.method) {
      // Gets the chosen user's artworks
      case 'GET': {
        const user = await UserRepository.findOne(userId);
        if (!user) {
          res.status(404).json({ message: 'User not found.' });
          return;
        }
        const artworks = await ArtworkRepository.findAllByUser(user.id);
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

export default userArtworksController;
