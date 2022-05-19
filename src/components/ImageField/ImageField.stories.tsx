import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ImageField as ImageFieldComponent } from '@src/components/ImageField';
import '@src/styles/index.scss';

export default {
  title: 'Forms/Image Field',
  component: ImageFieldComponent,
} as ComponentMeta<typeof ImageFieldComponent>;

export const ImageField: ComponentStory<typeof ImageFieldComponent> = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  return <ImageFieldComponent value={image} onChange={data => setImage(data?.image ?? null)} />;
};
