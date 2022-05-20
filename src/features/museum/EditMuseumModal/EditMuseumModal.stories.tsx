import { Fragment, useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import api from '@src/api';
import Button from '@src/components/Button';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import { EditMuseumModal } from '@src/features/museum/EditMuseumModal';
import { EditIcon } from '@src/svgs/icons/EditIcon';
import '@src/styles/index.scss';

export default {
  title: 'Modals/Edit Museum',
  component: EditMuseumModal,
} as ComponentMeta<typeof EditMuseumModal>;

export const EditMuseum: ComponentStory<typeof EditMuseumModal> = () => {
  const [museum, setMuseum] = useState<MuseumDto | null>(null);
  const [galleries, setGalleries] = useState<GalleryDto[]>([]);

  useEffect(() => {
    (async () => {
      const museum = await api.museum.findOneById('abc-123');
      if (!museum) {
        return;
      }
      const galleries = await api.gallery.findAllByMuseum(museum);
      setMuseum(museum);
      setGalleries(galleries);
    })();
  }, []);

  if (!museum) {
    return <Fragment />;
  }

  return (
    <EditMuseumModal
      museum={museum}
      galleries={galleries}
      trigger={<Button icon={EditIcon}>Edit museum</Button>}
      onSave={() => {}}
    />
  );
};
