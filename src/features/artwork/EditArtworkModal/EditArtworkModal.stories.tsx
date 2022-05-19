import { Fragment, useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import api from '@src/api';
import Button from '@src/components/Button';
import '@src/styles/index.scss';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { EditArtworkModal } from '@src/features/artwork/EditArtworkModal';
import { AuthProvider } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';

export default {
  title: 'Modals/Edit Artwork',
  component: EditArtworkModal,
} as ComponentMeta<typeof EditArtworkModal>;

export const Default: ComponentStory<typeof EditArtworkModal> = () => {
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
    <AuthProvider>
      <EditArtworkModal
        artwork={artwork}
        trigger={<Button icon={EditIcon}>Edit</Button>}
        onComplete={() => {}}
      />
    </AuthProvider>
  );
};
