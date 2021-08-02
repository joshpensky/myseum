import { NextApiHandler } from 'next';
import * as z from 'zod';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { MuseumSerializer } from '@src/data/MuseumSerializer';

const museumDetailController: NextApiHandler = async (req, res) => {
  const museumId = z.number().int().safeParse(Number(req.query.museumId));
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a single museum ID' });
    return;
  }

  try {
    switch (req.method) {
      // Get the collection for the museum with the given ID
      case 'GET': {
        const museum = await MuseumRepository.findOne(museumId.data);
        if (!museum) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        const collection = await MuseumRepository.getCollection(museum);
        res.status(200).json(MuseumSerializer.serializeCollection(collection));
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

export default museumDetailController;
