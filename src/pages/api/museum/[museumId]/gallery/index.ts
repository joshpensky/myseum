import { NextApiHandler } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';
import { supabase } from '@src/data/supabase';

const galleryDetailHandler: NextApiHandler = async (req, res) => {
  const museumId = z.number().int().safeParse(Number(req.query.museumId));
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a valid museum ID' });
    return;
  }

  try {
    switch (req.method) {
      // Creates a gallery
      case 'POST': {
        // Check that the user is authorized
        const auth = await supabase.auth.api.getUserByCookie(req);
        if (!auth.user) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        // Fetch the museum
        const museum = await MuseumRepository.findOne(museumId.data);
        if (!museum) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        // Only allow curators to update their own museum
        if (auth.user.id !== museum.curator.id) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        // Create the gallery
        const createdGallery = await GalleryRepository.create({ ...req.body, museumId: museum.id });
        res.status(200).json(GallerySerializer.serialize(createdGallery));
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

export default galleryDetailHandler;
