import { NextApiHandler } from 'next';
import { Gallery } from '@prisma/client';
import * as z from 'zod';
import { ArtworkProps } from '@src/components/Artwork';
import { MuseumRepository } from '@src/data/MuseumRepository';

export type MuseumCollectionItem = ArtworkProps['data'] & {
  gallery: Gallery;
};

const museumDetailController: NextApiHandler = async (req, res) => {
  const museumId = z.number().int().safeParse(Number(req.query.museumId));
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a single museum ID' });
    return;
  }

  try {
    switch (req.method) {
      // Updates the chosen user
      case 'GET': {
        const museum = await MuseumRepository.findOne(museumId.data);
        if (!museum) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }

        const collection: MuseumCollectionItem[] = museum.galleries
          .map(({ artworks, ...gallery }) =>
            artworks.map(artwork => ({
              ...artwork.artwork,
              gallery,
            })),
          )
          .flat();

        res.status(200).json(collection);
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

export default museumDetailController;
