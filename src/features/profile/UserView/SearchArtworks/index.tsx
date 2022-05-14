import { Fragment, useState } from 'react';
import axios from 'axios';
import cx from 'classnames';
import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import Fuse from 'fuse.js';
import useSWR from 'swr';
import { AlertDialog } from '@src/components/AlertDialog';
import Button from '@src/components/Button';
import IconButton from '@src/components/IconButton';
import { Loader } from '@src/components/Loader';
import { SearchBar } from '@src/components/SearchBar';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';
import { CreateArtworkModal } from '@src/features/artwork/CreateArtworkModal';
import { useAuth } from '@src/providers/AuthProvider';
import { ArtworkIllustration } from '@src/svgs/ArtworkIllustration';
import { EditIcon } from '@src/svgs/EditIcon';
import { ExpandIcon } from '@src/svgs/ExpandIcon';
import { PlusIcon } from '@src/svgs/PlusIcon';
import { TrashIcon } from '@src/svgs/TrashIcon';
import { getImageUrl } from '@src/utils/getImageUrl';
import styles from './searchArtworks.module.scss';

interface ArtworkRowProps {
  artwork: ArtworkDto;
  onDelete(): void;
}

const ArtworkRow = ({ artwork, onDelete }: ArtworkRowProps) => {
  const [hasDeleteIntent, setHasDeleteIntent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const auth = useAuth();
  const isOwner = auth.user?.id === artwork.owner.id;

  return (
    <div className={styles.row}>
      <div
        className={cx(
          styles.rowImage,
          artwork.size.height > artwork.size.width && styles.rowImageVertical,
        )}
        style={{ '--aspect-ratio': artwork.size.width / artwork.size.height }}>
        <img src={getImageUrl('artworks', artwork.src)} alt={artwork.alt ?? ''} />
      </div>

      <div className={styles.rowMeta}>
        <p>{artwork.title}</p>
        <p className={styles.rowMetaDesc}>
          {Array.from(
            new Set([
              artwork.artist?.name ?? 'Unknown',
              artwork.createdAt ? dayjs(artwork.createdAt).year() : 'Unknown',
            ]),
          ).join(', ')}
        </p>
      </div>

      <div className={styles.rowActions}>
        {/* TODO: fullscreen artwork */}
        <IconButton title="Expand">
          <ExpandIcon />
        </IconButton>

        {isOwner && (
          <Fragment>
            {/* TODO: edit artwork */}
            <IconButton title="Edit">
              <EditIcon />
            </IconButton>

            <AlertDialog
              open={hasDeleteIntent}
              onOpenChange={setHasDeleteIntent}
              title="Delete Artwork"
              description={`Are you sure you want to delete the artwork "${artwork.title}"?`}
              hint="This action cannot be undone."
              action={
                <Button
                  danger
                  filled
                  busy={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await axios.delete(`/api/artworks/${artwork.id}`);
                      onDelete();
                    } catch {
                      // TODO: toast error
                    } finally {
                      setHasDeleteIntent(false);
                      setIsDeleting(false);
                    }
                  }}>
                  Delete
                </Button>
              }
              trigger={
                <IconButton title="Delete">
                  <TrashIcon />
                </IconButton>
              }
            />
          </Fragment>
        )}
      </div>
    </div>
  );
};

interface SearchArtworksProps {
  user: UserDto;
}

export const SearchArtworks = ({ user }: SearchArtworksProps) => {
  const auth = useAuth();
  const isCurrentUser = auth.user?.id === user.id;

  const artworks = useSWR<ArtworkDto[]>(`/api/user/${user.id}/artworks`, {
    revalidateOnFocus: false,
  });
  const data = artworks.data ?? [];

  return (
    <Formik
      initialValues={{ search: '' }}
      onSubmit={(values, helpers) => {
        helpers.setSubmitting(false);
      }}>
      {formik => {
        const { values } = formik;

        const fuse = new Fuse(data, {
          keys: ['title', 'description', 'alt', 'artist.name'],
        });

        let results: { item: ArtworkDto }[];
        if (values.search) {
          results = fuse.search(values.search);
        } else {
          results = data.map(item => ({ item }));
        }

        return (
          <div className={styles.root}>
            <Form className={styles.form} noValidate>
              <SearchBar name="search" label="Search artworks" />
              {isCurrentUser && (
                <CreateArtworkModal
                  onComplete={() => {
                    artworks.revalidate();
                  }}
                  trigger={
                    <Button className={styles.formAction} type="button" icon={PlusIcon}>
                      Create
                    </Button>
                  }
                />
              )}
            </Form>

            <p className={styles.count}>
              {results.length} item{results.length === 1 ? '' : 's'} {values.search && 'found'}
            </p>

            {artworks.isValidating ? (
              <div className={styles.loading}>
                <Loader size="large" />
              </div>
            ) : !results.length ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIllo}>
                  <ArtworkIllustration />
                </div>
                <p className={styles.emptyStateText}>
                  {values.search
                    ? `No artworks found for term "${values.search}."`
                    : `${isCurrentUser ? 'You have' : 'there are'} no artworks.`}
                </p>
                {isCurrentUser && (
                  <CreateArtworkModal
                    onComplete={() => {
                      artworks.revalidate();
                    }}
                    trigger={<Button className={styles.emptyStateAction}>Create artwork</Button>}
                  />
                )}
              </div>
            ) : (
              <ul>
                {results.map(result => (
                  <li key={result.item.id} className={styles.rowWrapper}>
                    <ArtworkRow
                      artwork={result.item}
                      onDelete={() => {
                        artworks.revalidate();
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }}
    </Formik>
  );
};
