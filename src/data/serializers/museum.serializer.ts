import { Museum, User } from '@prisma/client';
import { GalleryDto } from './gallery.serializer';
import { UserDto, UserSerializer } from './user.serializer';

export interface PrismaMuseum extends Museum {
  curator: User;
}

export interface MuseumDto {
  id: number;
  name: string;
  description: string;
  curator: UserDto;
  addedAt: Date;
  modifiedAt: Date;
}

export interface MuseumWithGalleriesDto extends MuseumDto {
  galleries: GalleryDto[];
}

export class MuseumSerializer {
  static serialize(museum: PrismaMuseum): MuseumDto {
    return {
      id: museum.id,
      name: museum.name,
      description: museum.description,
      curator: UserSerializer.serialize({ ...museum.curator, museum }),
      addedAt: museum.addedAt,
      modifiedAt: museum.modifiedAt,
    };
  }
}
