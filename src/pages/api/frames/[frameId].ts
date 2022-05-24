import { NextApiHandler } from 'next';
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs';
import { FrameRepository } from '@src/data/repositories/frame.repository';

const frameDetailController: NextApiHandler = async (req, res) => {
  const frameId = req.query.frameId;
  if (typeof frameId !== 'string') {
    res.status(400).json({ message: 'Must supply a single frame ID' });
    return;
  }

  // Protect endpoint for only authenticated users
  const auth = await supabaseServerClient({ req, res }).auth.api.getUserByCookie(req);
  if (!auth.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  try {
    switch (req.method) {
      case 'DELETE': {
        const frame = await FrameRepository.findOne(frameId);
        if (!frame) {
          res.status(404).json({ message: 'Frame not found.' });
          return;
        } else if (frame.owner.id !== auth.user.id) {
          res.status(401).json({ message: 'You do not have permissions to delete this frame.' });
          return;
        }
        FrameRepository.delete(frame);
        res.status(204).json({ success: true });
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'DELETE');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default frameDetailController;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
