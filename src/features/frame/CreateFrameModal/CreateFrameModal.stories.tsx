import { ComponentStory, ComponentMeta } from '@storybook/react';
import Button from '@src/components/Button';
import '@src/styles/index.scss';
import { CreateFrameModal } from '@src/features/frame/CreateFrameModal';
import { PlusIcon } from '@src/svgs/PlusIcon';

export default {
  title: 'Modals/Create Frame',
  component: CreateFrameModal,
} as ComponentMeta<typeof CreateFrameModal>;

export const CreateFrame: ComponentStory<typeof CreateFrameModal> = () => (
  <CreateFrameModal trigger={<Button icon={PlusIcon}>Create frame</Button>} onComplete={() => {}} />
);
