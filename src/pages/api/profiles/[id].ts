import { NextApiHandler } from 'next';
import type { Profile } from '@prisma/client';
import { prisma } from '@src/lib/prisma';

type UpdateProfileDto = Omit<Profile, 'id'>;
/**
 * Updates the profile for the given user. If a profile doesn't exist,
 * this creates one.
 *
 * @param userId the ID of the user profile to update
 * @param updateProfileDto the data to update the profile with
 * @returns the updated profile
 */
export const updateProfile = async (userId: string, updateProfileDto: UpdateProfileDto) => {
  const profile = await prisma.profile.upsert({
    create: {
      id: userId,
      bio: updateProfileDto.bio,
    },
    update: {
      bio: updateProfileDto.bio,
    },
    where: {
      id: userId,
    },
  });
  return profile;
};

export const getProfile = async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: {
      id: userId,
    },
  });
  return profile;
};

const profileIdHandler: NextApiHandler = async (req, res) => {
  const userId = req.query.id;
  if (typeof userId !== 'string') {
    res.status(400).json({ message: 'Can only use one user ID' });
    return;
  }

  console.log(req);
  try {
    switch (req.method) {
      case 'GET': {
        const profile = await getProfile(userId);
        res.status(200).json({ profile });
        break;
      }
      case 'PATCH': {
        const profile = await updateProfile(userId, req.body);
        res.status(200).json({ profile });
        break;
      }
      default: {
        res.status(404).json({ message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default profileIdHandler;
