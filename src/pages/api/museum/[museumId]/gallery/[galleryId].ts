import { NextApiHandler } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';

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
      case 'PUT': {
        const gallery = await GalleryRepository.findOneByMuseum(museumId.data, galleryId.data);
        if (!gallery) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        const updatedGallery = await GalleryRepository.update(gallery, req.body);
        res.status(200).json(GallerySerializer.serialize(updatedGallery));
        break;
      }

      // Updates the chosen gallery
      case 'DELETE': {
        const gallery = await GalleryRepository.findOneByMuseum(museumId.data, galleryId.data);
        if (!gallery) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        const deletedGallery = await GalleryRepository.delete(gallery);
        res.status(204).json(GallerySerializer.serialize(deletedGallery));
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'PUT');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default galleryDetailHandler;
