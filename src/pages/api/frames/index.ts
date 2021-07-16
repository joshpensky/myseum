import { NextApiHandler } from 'next';
import { FrameRepository } from '@src/data/FrameRepository';

const frameIndexController: NextApiHandler = async (req, res) => {
  try {
    switch (req.method) {
      // Gets all frames
      case 'GET': {
        const frames = await FrameRepository.findAll();
        res.status(200).json(frames);
        break;
      }

      // Create new frame
      case 'POST': {
        const frame = await FrameRepository.create(req.body);
        res.status(200).json(frame);
        break;
      }

      // Otherwise, throw 404
      default: {
        res.status(404).json({ message: 'Not found.' });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default frameIndexController;
