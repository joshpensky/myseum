import { User } from '@prisma/client';

export interface PrismaUser extends User {
  museum: { id: number } | null;
}

export interface UserDto {
  id: string;
  name: string;
  bio: string;
  headshot: string | null;
  museumId: number;
  addedAt: Date;
  modifiedAt: Date;
}

export class UserSerializer {
  static serialize(user: PrismaUser): UserDto {
    return {
      id: user.id,
      name: user.name,
      headshot: user.headshot ?? null,
      bio: user.bio,
      // We are force-casting this, since it _should_ always be defined
      museumId: user.museum?.id as number,
      addedAt: user.addedAt,
      modifiedAt: user.modifiedAt,
    };
  }
}
