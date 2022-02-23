import { NextApiHandler } from 'next';
import * as z from 'zod';
import { GalleryRepository } from '@src/data/repositories/gallery.repository';
import { MuseumRepository } from '@src/data/repositories/museum.repository';
import { GallerySerializer } from '@src/data/serializers/gallery.serializer';
import { MuseumSerializer, MuseumWithGalleriesDto } from '@src/data/serializers/museum.serializer';

const museumDetailController: NextApiHandler = async (req, res) => {
  const museumId = z.number().int().safeParse(Number(req.query.museumId));
  if (!museumId.success) {
    res.status(400).json({ message: 'Must supply a single museum ID' });
    return;
  }

  try {
    switch (req.method) {
      // Updates the museum with the given ID
      case 'GET': {
        const museum = await MuseumRepository.findOne(museumId.data);
        if (!museum) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        const galleries = await GalleryRepository.findAllByMuseum(museum.id);
        const data: MuseumWithGalleriesDto = {
          ...MuseumSerializer.serialize(museum),
          galleries: galleries.map(gallery => GallerySerializer.serialize(gallery)),
        };
        res.status(200).json(data);
        break;
      }

      // Updates the museum with the given ID
      case 'PUT': {
        const museum = await MuseumRepository.findOne(museumId.data);
        if (!museum) {
          res.status(404).json({ message: 'Not found.' });
          return;
        }
        const updatedMuseum = await MuseumRepository.update(museum, req.body);
        const updatedGalleries = await GalleryRepository.findAllByMuseum(museum.id);
        const data: MuseumWithGalleriesDto = {
          ...MuseumSerializer.serialize(updatedMuseum),
          galleries: updatedGalleries.map(gallery => GallerySerializer.serialize(gallery)),
        };
        res.status(200).json(data);
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'GET, PUT');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default museumDetailController;
