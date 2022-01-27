import { prisma } from '@src/data/prisma';

export class ArtistRepository {
  static async findAll() {
    const artists = await prisma.artist.findMany();
    return artists;
  }
}
