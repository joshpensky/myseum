import Button from '@src/components/Button';
import { CreateArtworkModal } from '@src/features/create-artwork';

export default function Test() {
  return (
    <div>
      <h1>Test</h1>
      <CreateArtworkModal onComplete={() => {}} trigger={<Button filled>Open</Button>} />
    </div>
  );
}
