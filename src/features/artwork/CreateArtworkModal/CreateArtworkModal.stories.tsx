import { ComponentStory, ComponentMeta } from '@storybook/react';
import Button from '@src/components/Button';
import { CreateArtworkModal } from '@src/features/artwork/CreateArtworkModal';
import '@src/styles/index.scss';
import { PlusIcon } from '@src/svgs/PlusIcon';

export default {
  title: 'Modals/Create Artwork',
  component: CreateArtworkModal,
} as ComponentMeta<typeof CreateArtworkModal>;

export const CreateArtwork: ComponentStory<typeof CreateArtworkModal> = () => (
  <CreateArtworkModal
    trigger={<Button icon={PlusIcon}>Create artwork</Button>}
    onComplete={() => {}}
  />
);
