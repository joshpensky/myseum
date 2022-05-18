import { ComponentStory, ComponentMeta } from '@storybook/react';
import '@src/styles/index.scss';
import IconButton from '@src/components/IconButton';
import { EditIcon } from '@src/svgs/EditIcon';

export default {
  title: 'Buttons/Icon',
  component: IconButton,
  argTypes: {
    disabled: {
      defaultValue: false,
      control: 'boolean',
    },
  },
} as ComponentMeta<typeof IconButton>;

export const Default: ComponentStory<typeof IconButton> = args => (
  <IconButton {...args}>
    <EditIcon />
  </IconButton>
);
