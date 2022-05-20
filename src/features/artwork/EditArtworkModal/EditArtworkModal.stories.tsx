import { Fragment, useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import api from '@src/api';
import Button from '@src/components/Button';
import '@src/styles/index.scss';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { EditArtworkModal } from '@src/features/artwork/EditArtworkModal';
import { EditIcon } from '@src/svgs/icons/EditIcon';

export default {
  title: 'Modals/Edit Artwork',
  component: EditArtworkModal,
} as ComponentMeta<typeof EditArtworkModal>;

export const EditArtwork: ComponentStory<typeof EditArtworkModal> = () => {
  const [artwork, setArtwork] = useState<ArtworkDto | null>(null);

  useEffect(() => {
    (async () => {
      const user = await api.user.findOneById('abc-123');
      if (!user) {
        return;
      }
      const artworks = await api.artwork.findAllByUser(user);
      setArtwork(artworks[0]);
    })();
  }, []);

  if (!artwork) {
    return <Fragment />;
  }

  return (
    <EditArtworkModal
      artwork={artwork}
      trigger={<Button icon={EditIcon}>Edit artwork</Button>}
      onComplete={() => {}}
    />
  );
};
