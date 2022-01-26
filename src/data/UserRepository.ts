import type { User } from '@prisma/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import * as z from 'zod';
import { prisma } from '@src/data/prisma';
import { PrismaUser } from './UserSerializer';

type UpdateUserDto = Partial<Omit<User, 'id'>>;

export class UserRepository {
  /**
   * Finds the public user data for a given user.
   *
   * @param user the Supabase auth user object
   * @returns the user's public data
   */
  static async findOne(user: SupabaseUser): Promise<PrismaUser>;
  /**
   * Finds the public user data for the given ID..
   *
   * @param userId the ID of the user
   * @returns the user, or null if not found
   */
  static async findOne(userId: string): Promise<PrismaUser | null>;
  static async findOne(userOrId: SupabaseUser | string): Promise<PrismaUser | null> {
    // Get user ID
    let userId: string;
    if (typeof userOrId === 'string') {
      userId = userOrId;
    } else {
      userId = userOrId.id;
    }

    // Check that passed ID is a UUID
    if (!z.string().uuid().safeParse(userId).success) {
      throw new Error('User ID must be a valid UUID.');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        museum: {
          select: {
            id: true,
          },
        },
      },
    });
    return user;
  }

  /**
   * Updates the profile for the given user. If a profile doesn't exist,
   * this creates one.
   *
   * @param user the user to update
   * @param updateProfileDto the data to update the profile with
   * @returns the updated profile
   */
  static async update(
    user: User | SupabaseUser,
    updateUserDto: UpdateUserDto,
  ): Promise<PrismaUser> {
    const updatedUser = await prisma.user.update({
      data: {
        bio: updateUserDto.bio,
      },
      where: {
        id: user.id,
      },
      include: {
        museum: {
          select: {
            id: true,
          },
        },
      },
    });
    return updatedUser;
  }
}
