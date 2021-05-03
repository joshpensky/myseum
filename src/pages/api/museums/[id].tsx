import { NextApiHandler } from 'next';
import * as z from 'zod';
import { MuseumRepository } from '@src/data/MuseumRepository';

const museumDetailController: NextApiHandler = async (req, res) => {
  const museumId = z.number().int().safeParse(Number(req.query.id));
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a single museum ID' });
    return;
  }

  try {
    switch (req.method) {
      // Updates the chosen user
      case 'PATCH': {
        const museum = await MuseumRepository.findById(museumId.data);
        if (!museum) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        const updatedMuseum = await MuseumRepository.update(museum, req.body);
        res.status(200).json({ museum: updatedMuseum });
        break;
      }

      // Otherwise, throw 404
      default: {
        res.status(404).json({ message: 'Not found.' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export default museumDetailController;
