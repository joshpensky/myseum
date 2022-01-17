import { useState } from 'react';
import { CreateUpdateArtwork } from '@src/features/create-update-artwork';

const ArtworkRoute = () => {
  const [open, setOpen] = useState(true);

  return <CreateUpdateArtwork open={open} onOpenChange={setOpen} trigger={<button>Open</button>} />;
};

export default ArtworkRoute;
