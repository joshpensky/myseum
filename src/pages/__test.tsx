import Button from '@src/components/Button';
import { CreateArtworkModal } from '@src/features/artwork/CreateArtworkModal';

// TODO: remove after plane ride
export default function Test() {
  return (
    <div>
      <h1>Test</h1>
      <CreateArtworkModal onComplete={() => {}} trigger={<Button filled>Create Artwork</Button>} />
    </div>
  );
}
