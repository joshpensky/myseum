import { ComponentStory, ComponentMeta } from '@storybook/react';
import Button from '@src/components/Button';
import { CreateGalleryModal } from '@src/features/gallery/CreateGalleryModal';
import { PlusIcon } from '@src/svgs/icons/PlusIcon';
import '@src/styles/index.scss';

export default {
  title: 'Modals/Create Gallery',
  component: CreateGalleryModal,
} as ComponentMeta<typeof CreateGalleryModal>;

export const CreateGallery: ComponentStory<typeof CreateGalleryModal> = () => (
  <CreateGalleryModal trigger={<Button icon={PlusIcon}>Create gallery</Button>} />
);
