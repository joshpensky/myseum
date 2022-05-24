import { NextApiHandler } from 'next';
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';

const placedArtworksIndexHandler: NextApiHandler = async (req, res) => {
  const museumId = z.string().uuid().safeParse(req.query.museumId);
  const galleryId = z.string().uuid().safeParse(req.query.galleryId);
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a valid museum ID' });
    return;
  } else if (!galleryId.success) {
    res.status(400).json({ message: 'Must supply a valid gallery ID' });
    return;
  }

  // Protect endpoint for only authenticated users
  const auth = await supabaseServerClient({ req, res }).auth.api.getUserByCookie(req);
  if (!auth.user) {
    res.status(401).json({ message: 'Unauthorized.' });
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
        } else if (gallery.museum.curator.id !== auth.user.id) {
          res.status(401).json({ message: 'You do not have permissions to update this gallery.' });
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

export default placedArtworksIndexHandler;
