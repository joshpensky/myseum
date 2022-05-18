import { ComponentStory, ComponentMeta } from '@storybook/react';
import Button from '@src/components/Button';
import { CreateArtworkModal } from '@src/features/artwork/CreateArtworkModal';
import '@src/styles/index.scss';
import { AuthProvider } from '@src/providers/AuthProvider';
import { PlusIcon } from '@src/svgs/PlusIcon';

export default {
  title: 'Modals/Create Artwork',
  component: CreateArtworkModal,
} as ComponentMeta<typeof CreateArtworkModal>;

export const Default: ComponentStory<typeof CreateArtworkModal> = () => (
  <AuthProvider>
    <CreateArtworkModal trigger={<Button icon={PlusIcon}>Create</Button>} onComplete={() => {}} />
  </AuthProvider>
);
