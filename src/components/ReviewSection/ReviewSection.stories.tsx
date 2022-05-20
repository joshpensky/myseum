import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ReviewSection as ReviewSectionComponent } from '@src/components/ReviewSection';
import { DetailsIcon } from '@src/svgs/icons/DetailsIcon';
import '@src/styles/index.scss';

export default {
  title: 'Review Section',
  component: ReviewSectionComponent,
} as ComponentMeta<typeof ReviewSectionComponent>;

export const ReviewSection: ComponentStory<typeof ReviewSectionComponent> = args => (
  <ReviewSectionComponent {...args} icon={DetailsIcon} title="Details">
    <dl>
      <dt>Title</dt>
      <dd>A Bit of Chest Pain</dd>

      <dt>Artist</dt>
      <dd>Unknown</dd>

      <dt>Description</dt>
      <dd>She has a bit of chest pain. Hard to tell why.</dd>

      <dt>Created</dt>
      <dd>Unknown</dd>

      <dt>Acquired</dt>
      <dd>May 17, 2022</dd>
    </dl>
  </ReviewSectionComponent>
);
