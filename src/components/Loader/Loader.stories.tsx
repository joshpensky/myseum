import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Loader } from '@src/components/Loader';
import '@src/styles/index.scss';

export default {
  title: 'Loader',
  component: Loader,
  argTypes: {
    size: {
      defaultValue: 'normal',
      control: 'inline-radio',
      options: ['normal', 'large'],
    },
  },
} as ComponentMeta<typeof Loader>;

export const Default: ComponentStory<typeof Loader> = args => <Loader {...args} />;
