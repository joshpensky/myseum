import { NextApiHandler } from 'next';
import { FrameRepository } from '@src/data/FrameRepository';
import { FrameSerializer } from '@src/data/FrameSerializer';

const frameIndexController: NextApiHandler = async (req, res) => {
  try {
    switch (req.method) {
      // Gets all frames
      case 'GET': {
        const frames = await FrameRepository.findAll();
        const serializedFrames = frames.map(frame => FrameSerializer.serialize(frame));
        res.status(200).json(serializedFrames);
        break;
      }

      // Create new frame
      case 'POST': {
        const frame = await FrameRepository.create(req.body);
        res.status(200).json(FrameSerializer.serialize(frame));
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'GET, POST');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default frameIndexController;
