import { useState } from 'react';
import Button from '@src/components/Button';
import { CreateArtwork } from '@src/features/create-artwork';

const ArtworkRoute = () => {
  const [open, setOpen] = useState(true);

  return <CreateArtwork open={open} onOpenChange={setOpen} trigger={<Button>Open</Button>} />;
};

export default ArtworkRoute;
