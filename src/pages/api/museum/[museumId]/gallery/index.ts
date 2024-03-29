import { NextApiHandler } from 'next';
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';

const galleryIndexHandler: NextApiHandler = async (req, res) => {
  const museumId = z.string().uuid().safeParse(req.query.museumId);
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a valid museum ID' });
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
      // Creates a gallery
      case 'POST': {
        // Fetch the museum
        const museum = await MuseumRepository.findOne(museumId.data);
        if (!museum) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        // Only allow curators to update their own museum
        if (auth.user.id !== museum.curator.id) {
          res.status(401).json({ message: 'You do not have permissions to update this museum.' });
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

export default galleryIndexHandler;
