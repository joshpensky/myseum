import { NextApiHandler } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';

const galleryArtworksHandler: NextApiHandler = async (req, res) => {
  const museumId = z.string().uuid().safeParse(req.query.museumId);
  const galleryId = z.string().uuid().safeParse(req.query.galleryId);
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a valid museum ID' });
    return;
  } else if (!galleryId.success) {
    res.status(400).json({ message: 'Must supply a valid gallery ID' });
    return;
  }

  try {
    switch (req.method) {
      // Adds a new placed artwork
      case 'POST': {
        const gallery = await GalleryRepository.findOneByMuseum(museumId.data, galleryId.data);
        if (!gallery) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        const addedPlacedArtwork = await GalleryRepository.addArtwork(gallery, req.body);
        res.status(200).json(GallerySerializer.serializeArtwork(addedPlacedArtwork));
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default galleryArtworksHandler;