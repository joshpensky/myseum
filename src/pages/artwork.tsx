import { useState } from 'react';
import Button from '@src/components/Button';
import { CreateUpdateArtwork } from '@src/features/create-update-artwork';

const ArtworkRoute = () => {
  const [open, setOpen] = useState(true);

  return <CreateUpdateArtwork open={open} onOpenChange={setOpen} trigger={<Button>Open</Button>} />;
};

export default ArtworkRoute;
