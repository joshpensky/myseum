import { ComponentStory, ComponentMeta } from '@storybook/react';
import Button from '@src/components/Button';
import '@src/styles/index.scss';
import { EditIcon } from '@src/svgs/EditIcon';

export default {
  title: 'Button',
  component: Button,
  argTypes: {
    filled: {
      defaultValue: false,
      control: 'boolean',
    },
    disabled: {
      defaultValue: false,
      control: 'boolean',
    },
    danger: {
      defaultValue: false,
      control: 'boolean',
    },
    busy: {
      defaultValue: false,
      control: 'boolean',
    },
  },
} as ComponentMeta<typeof Button>;

export const Default: ComponentStory<typeof Button> = args => <Button {...args}>Button</Button>;

export const Icon: ComponentStory<typeof Button> = args => (
  <Button {...args} icon={EditIcon}>
    Button
  </Button>
);
