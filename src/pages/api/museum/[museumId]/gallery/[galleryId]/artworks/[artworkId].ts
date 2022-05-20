import { NextApiHandler } from 'next';
import { z } from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';

const placedArtworkDetailController: NextApiHandler = async (req, res) => {
  const museumId = z.string().uuid().safeParse(req.query.museumId);
  const galleryId = z.string().uuid().safeParse(req.query.galleryId);
  const artworkId = z.string().uuid().safeParse(req.query.artworkId);
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a valid museum ID' });
    return;
  } else if (!galleryId.success) {
    res.status(400).json({ message: 'Must supply a valid gallery ID' });
    return;
  } else if (!artworkId.success) {
    res.status(400).json({ message: 'Must supply a valid artwork ID' });
    return;
  }

  try {
    switch (req.method) {
      case 'DELETE': {
        const gallery = await GalleryRepository.findOneByMuseum(museumId.data, galleryId.data);
        if (!gallery) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        GalleryRepository.deleteArtwork(gallery, artworkId.data);
        res.status(204).json({ success: true });
        break;
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default placedArtworkDetailController;
