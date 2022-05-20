import { Fragment, useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import api from '@src/api';
import Button from '@src/components/Button';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { EditGalleryModal } from '@src/features/gallery/EditGalleryModal';
import { EditIcon } from '@src/svgs/EditIcon';
import '@src/styles/index.scss';

export default {
  title: 'Modals/Edit Gallery',
  component: EditGalleryModal,
} as ComponentMeta<typeof EditGalleryModal>;

export const EditGallery: ComponentStory<typeof EditGalleryModal> = () => {
  const [gallery, setGallery] = useState<GalleryDto | null>(null);

  useEffect(() => {
    (async () => {
      const gallery = await api.gallery.findOneByMuseum('abc-123', 'abc-123');
      setGallery(gallery);
    })();
  }, []);

  if (!gallery) {
    return <Fragment />;
  }

  return (
    <EditGalleryModal
      gallery={gallery}
      trigger={<Button icon={EditIcon}>Edit gallery</Button>}
      onSave={() => {}}
    />
  );
};
