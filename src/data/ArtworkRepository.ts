import { prisma } from '@src/data/prisma';

export class ArtworkRepository {
  static async findAll() {
    const artworks = await prisma.artwork.findMany({
      include: {
        frame: true,
        artist: true,
      },
    });
    return artworks;
  }
}
