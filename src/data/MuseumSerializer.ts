import { Museum, User } from '@prisma/client';

export interface PrismaMuseum extends Museum {
  curator: User;
}

export interface MuseumDto {
  id: number;
  name: string;
  curator: User;
  createdAt: Date;
  updatedAt: Date;
}

export class MuseumSerializer {
  static serialize(museum: PrismaMuseum): MuseumDto {
    return {
      id: museum.id,
      name: museum.name,
      curator: museum.curator,
      createdAt: museum.createdAt,
      updatedAt: museum.updatedAt,
    };
  }
}
