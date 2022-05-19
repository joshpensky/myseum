import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Loader as LoaderComponent } from '@src/components/Loader';
import '@src/styles/index.scss';

export default {
  title: 'Loader',
  component: LoaderComponent,
  argTypes: {
    size: {
      defaultValue: 'normal',
      control: 'inline-radio',
      options: ['normal', 'large'],
    },
  },
} as ComponentMeta<typeof LoaderComponent>;

export const Loader: ComponentStory<typeof LoaderComponent> = args => <LoaderComponent {...args} />;
