import { forwardRef, PropsWithChildren, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import Fuse from 'fuse.js';
import { z } from 'zod';
import api from '@src/api';
import { Artwork } from '@src/components/Artwork';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import IconButton from '@src/components/IconButton';
import { SearchBar } from '@src/components/SearchBar';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { PlusIcon } from '@src/svgs/icons/PlusIcon';
import { TrashIcon } from '@src/svgs/icons/TrashIcon';
import { PlacedArtworkIllustration } from '@src/svgs/illustrations/PlacedArtworkIllustration';
import styles from './collectionScreen.module.scss';
import { CreateGalleryModalContext } from '..';
import { AddArtworkModal } from '../../AddArtworkModal';
import { CreateGalleryState } from '../state';

const collectionScreenSchema = z.object({
  search: z.string(),
});

type CollectionScreenSchema = z.infer<typeof collectionScreenSchema>;

interface CollectionScreenProps {
  state: CreateGalleryState<'collection'>;
  onBack(data: GalleryDto): void;
  onAddArtwork(data: PlacedArtworkDto): void;
  onSubmit(data: GalleryDto): void;
}

export const CollectionScreen = forwardRef<
  FormikProps<any>,
  PropsWithChildren<CollectionScreenProps>
>(function CollectionScreen({ children, state, onAddArtwork, onBack, onSubmit }, ref) {
  async function updateGallery() {
    const gallery = await api.gallery.update(
      state.context.gallery.museum.id,
      state.context.gallery.id,
      {
        name: state.context.gallery.name,
        description: state.context.gallery.description,
        artworks: state.context.gallery.artworks.map(item => ({
          id: item.id,
          position: item.position,
        })),
      },
    );
    return gallery;
  }

  const initialValues: CollectionScreenSchema = {
    search: '',
  };

  return (
    <FormModal.Screen title="Collection" description="Add artworks to your gallery collection.">
      <Formik<CollectionScreenSchema>
        innerRef={ref}
        initialValues={initialValues}
        onSubmit={async (values, helpers) => {
          try {
            const gallery = await updateGallery();
            onSubmit(gallery);
          } catch (error) {
            console.error(error);
            helpers.setSubmitting(false);
          }
        }}>
        {formik => {
          const { values, isSubmitting, setSubmitting } = formik;
          const [hasBackIntent, setHasBackIntent] = useState(false);

          const fuse = new Fuse(state.context.gallery.artworks, {
            keys: [
              'artwork.title',
              'artwork.description',
              'artwork.alt',
              'artwork.artist.name',
              'frame.name',
              'frame.alt',
            ],
          });

          let results: { item: PlacedArtworkDto }[];
          if (values.search) {
            results = fuse.search(values.search);
          } else {
            results = state.context.gallery.artworks.map(item => ({ item }));
          }

          return (
            <Form className={styles.form} noValidate>
              <div className={styles.formBody}>
                <div className={styles.search}>
                  <SearchBar name="search" label="Search collection" />
                  <AddArtworkModal
                    gallery={state.context.gallery}
                    onSave={data => {
                      onAddArtwork(data);
                    }}
                    trigger={
                      <Button className={styles.searchAction} type="button" icon={PlusIcon}>
                        Add
                      </Button>
                    }
                  />
                </div>

                <p className={styles.count}>
                  {results.length} item{results.length === 1 ? '' : 's'} {values.search && 'found'}
                </p>

                {!results.length ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIllo}>
                      <PlacedArtworkIllustration />
                    </div>
                    <p className={styles.emptyStateText}>
                      {values.search
                        ? `No artworks found for term "${values.search}."`
                        : `You've added no artworks.`}
                    </p>
                    <AddArtworkModal
                      gallery={state.context.gallery}
                      onSave={data => {
                        onAddArtwork(data);
                      }}
                      trigger={
                        <Button className={styles.searchAction} type="button">
                          Add artwork
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <ul>
                    {results.map(({ item }) => (
                      <li key={item.id} className={styles.collectionRow}>
                        <div className={styles.collectionRowPreview}>
                          <Artwork item={item} disabled />
                        </div>

                        <div className={styles.collectionRowMeta}>
                          <p>{item.artwork.title}</p>
                          <p>{item.artwork.artist?.name ?? 'Unknown'}</p>
                        </div>

                        {/* TODO: delete placed artwork */}
                        <IconButton type="button" title="Delete" onClick={() => {}}>
                          <TrashIcon />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                )}

                <CreateGalleryModalContext.Provider
                  value={{
                    height: state.context.gallery.height,
                    color: state.context.gallery.color,
                  }}>
                  {children}
                </CreateGalleryModalContext.Provider>
              </div>

              <FormModal.Footer>
                <Button
                  type="button"
                  busy={hasBackIntent}
                  onClick={async () => {
                    setHasBackIntent(true);
                    setSubmitting(true);
                    try {
                      const gallery = await updateGallery();
                      onBack(gallery);
                    } catch (error) {
                      console.error(error);
                      setHasBackIntent(false);
                      setSubmitting(false);
                    }
                  }}>
                  Back
                </Button>

                <Button
                  type="submit"
                  filled
                  busy={isSubmitting && !hasBackIntent}
                  disabled={hasBackIntent}>
                  Save
                </Button>
              </FormModal.Footer>
            </Form>
          );
        }}
      </Formik>
    </FormModal.Screen>
  );
});
