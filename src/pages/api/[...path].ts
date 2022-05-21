import { NextApiHandler } from 'next';

const notFoundController: NextApiHandler = (req, res) => {
  res.status(404).json({
    code: 'not_found',
    message: 'Endpoint not found.',
  });
};

export default notFoundController;
