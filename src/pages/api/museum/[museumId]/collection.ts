import { NextApiHandler } from 'next';
import * as z from 'zod';
import { ArtworkDto } from '@src/data/ArtworkSerializer';
import { GalleryDto, GallerySerializer } from '@src/data/GallerySerializer';
import { MuseumRepository } from '@src/data/MuseumRepository';

export type MuseumCollectionItem = {
  artwork: ArtworkDto;
  gallery: Omit<GalleryDto, 'artworks'>;
};

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

        const uniqueIdSet = new Set<number>();
        const collection: MuseumCollectionItem[] = museum.galleries
          .map(gallery => {
            const serializedGallery = GallerySerializer.serialize(gallery);
            const { artworks, ...galleryDto } = serializedGallery;
            return artworks.map(item => ({ artwork: item.artwork, gallery: galleryDto }));
          })
          .flat()
          .filter(item => {
            if (!uniqueIdSet.has(item.artwork.id)) {
              uniqueIdSet.add(item.artwork.id);
              return true;
            }
            return false;
          });

        res.status(200).json(collection);
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
