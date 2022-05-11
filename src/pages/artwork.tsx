import { useState } from 'react';
import Button from '@src/components/Button';
import * as CreateArtwork from '@src/features/create-artwork-OLD';

const ArtworkRoute = () => {
  const [open, setOpen] = useState(true);

  return (
    <CreateArtwork.Root open={open} onOpenChange={setOpen} onComplete={data => console.log(data)}>
      <CreateArtwork.Trigger>
        <Button>Open</Button>
      </CreateArtwork.Trigger>
    </CreateArtwork.Root>
  );
};

export default ArtworkRoute;
