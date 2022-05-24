import { NextApiHandler } from 'next';
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs';
import { FrameRepository } from '@src/data/repositories/frame.repository';
import { FrameSerializer } from '@src/data/serializers/frame.serializer';

const frameIndexController: NextApiHandler = async (req, res) => {
  try {
    switch (req.method) {
      // Create new frame
      case 'POST': {
        const auth = await supabaseServerClient({ req, res }).auth.api.getUserByCookie(req);
        if (!auth.user) {
          res.status(401).json({ message: 'Unauthorized.' });
          return;
        }
        const frame = await FrameRepository.create({ ...req.body, ownerId: auth.user.id });
        res.status(200).json(FrameSerializer.serialize(frame));
        break;
      }

      // Otherwise, endpoint not found
      default: {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export default frameIndexController;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
