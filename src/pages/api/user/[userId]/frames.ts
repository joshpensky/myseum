import { NextApiHandler } from 'next';
import { FrameRepository } from '@src/data/repositories/frame.repository';
import { UserRepository } from '@src/data/repositories/user.repository';
import { FrameSerializer } from '@src/data/serializers/frame.serializer';

const userFramesController: NextApiHandler = async (req, res) => {
  const userId = req.query.userId;
  if (typeof userId !== 'string') {
    res.status(400).json({ message: 'Must supply a single user ID' });
    return;
  }

  try {
    switch (req.method) {
      // Gets the chosen user's frames
      case 'GET': {
        const user = await UserRepository.findOne(userId);
        if (!user) {
          res.status(404).json({ message: 'User not found.' });
          return;
        }
        const frames = await FrameRepository.findAllByUser(user.id);
        const serializedFrames = frames.map(frame => FrameSerializer.serialize(frame));
        res.status(200).json(serializedFrames);
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default userFramesController;
