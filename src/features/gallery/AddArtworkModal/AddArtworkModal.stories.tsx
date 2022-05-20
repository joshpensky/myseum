import { Fragment, useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import api from '@src/api';
import Button from '@src/components/Button';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { AddArtworkModal } from '@src/features/gallery/AddArtworkModal';
import { AuthProvider } from '@src/providers/AuthProvider';
import { PlusIcon } from '@src/svgs/PlusIcon';
import '@src/styles/index.scss';

export default {
  title: 'Modals/Add Artwork',
  component: AddArtworkModal,
} as ComponentMeta<typeof AddArtworkModal>;

export const AddArtwork: ComponentStory<typeof AddArtworkModal> = () => {
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
    <AuthProvider>
      <AddArtworkModal
        gallery={gallery}
        trigger={<Button icon={PlusIcon}>Add artwork</Button>}
        onSave={() => {}}
      />
    </AuthProvider>
  );
};
