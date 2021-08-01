import { NextApiHandler } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/GalleryRepository';
import { GallerySerializer } from '@src/data/GallerySerializer';

const galleryDetailHandler: NextApiHandler = async (req, res) => {
  const museumId = z.number().int().safeParse(Number(req.query.museumId));
  const galleryId = z.number().int().safeParse(Number(req.query.galleryId));
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a valid museum ID' });
    return;
  } else if (!galleryId.success) {
    res.status(400).json({ message: 'Must supply a valid gallery ID' });
    return;
  }

  try {
    switch (req.method) {
      // Updates the chosen gallery
      case 'PATCH': {
        const gallery = await GalleryRepository.findOneByMuseum(museumId.data, galleryId.data);
        if (!gallery) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        const updatedGallery = await GalleryRepository.update(gallery, req.body);
        res.status(200).json(GallerySerializer.serialize(updatedGallery));
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'PATCH');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default galleryDetailHandler;
