import { Museum, User } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { prisma } from '@src/data/prisma';

export class MuseumRepository {
  static async findById(id: number): Promise<Museum | null> {
    const museum = await prisma.museum.findUnique({
      where: { id },
      include: {
        curator: true,
      },
    });
    return museum;
  }

  static async findByUser(user: User | SupabaseUser): Promise<Museum | null> {
    const museum = await prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .museum({
        include: {
          curator: true,
        },
      });
    return museum;
  }
}
