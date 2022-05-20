import { forwardRef, PropsWithChildren, useState } from 'react';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import { Artwork } from '@src/components/Artwork';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import IconButton from '@src/components/IconButton';
import { SearchBar } from '@src/components/SearchBar';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import * as Grid from '@src/features/grid';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { EditIcon } from '@src/svgs/EditIcon';
import { PlacedArtworkIllustration } from '@src/svgs/PlacedArtworkIllustration';
import { PlusIcon } from '@src/svgs/PlusIcon';
import { TrashIcon } from '@src/svgs/TrashIcon';
import styles from './collectionScreen.module.scss';
import { CreateGalleryModalContext } from '..';
import { AddArtworkModal } from '../../AddArtworkModal';
import { CreateGalleryState } from '../state';

const BP_DRAWER = Number.parseInt(styles.varBpDrawer, 10);

interface CollectionScreenProps {
  state: CreateGalleryState<'collection'>;
  onBack(): void;
  onAddArtwork(data: PlacedArtworkDto): void;
  onSubmit(data: GalleryDto): void;
}

export const CollectionScreen = forwardRef<
  FormikProps<any>,
  PropsWithChildren<CollectionScreenProps>
>(function CollectionScreen({ children, state, onAddArtwork, onBack, onSubmit }, ref) {
  const [openGridModal, setOpenGridModal] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const query = window.matchMedia(`(max-width: ${BP_DRAWER - 1}px)`);
    if (!query.matches) {
      setOpenGridModal(false);
    }

    query.addEventListener('change', query => {
      if (!query.matches) {
        setOpenGridModal(false);
      }
    });
  }, []);

  return (
    <FormModal.Screen title="Collection" description="Add artworks to your gallery collection.">
      <Formik
        innerRef={ref}
        initialValues={{}}
        onSubmit={(values, helpers) => {
          // TODO: add artworks to gallery
          onSubmit(state.context.gallery);
          helpers.setSubmitting(false);
        }}>
        {formik => {
          const { isSubmitting } = formik;

          return (
            <Form className={styles.form} noValidate>
              <div className={styles.formBody}>
                <FormModal.Root
                  open={openGridModal}
                  onOpenChange={setOpenGridModal}
                  title="Place Artworks"
                  trigger={
                    <div
                      className={cx(styles.gridPreview, `theme--${state.context.gallery.color}`)}>
                      <Grid.Root
                        preview
                        size={{ width: 10, height: state.context.gallery.height }}
                        items={state.context.gallery.artworks}
                        step={1}
                        getItemId={item => item.artwork.id}
                        renderItem={(item, props) => (
                          <GridArtwork {...props} item={item} disabled={props.disabled} />
                        )}>
                        <Grid.Grid className={styles.gridPreviewGrid} />
                      </Grid.Root>
                      <IconButton className={styles.gridPreviewEdit} type="button" title="Edit">
                        <EditIcon />
                      </IconButton>
                    </div>
                  }>
                  <Grid.Root
                    size={{ width: 10, height: state.context.gallery.height }}
                    items={state.context.gallery.artworks}
                    step={1}
                    getItemId={item => item.artwork.id}
                    renderItem={(item, props) => (
                      <GridArtwork {...props} item={item} disabled={props.disabled} />
                    )}>
                    <Grid.Grid />
                    <Grid.Map />
                  </Grid.Root>
                </FormModal.Root>

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

                {!state.context.gallery.artworks.length ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIllo}>
                      <PlacedArtworkIllustration />
                    </div>
                    <p className={styles.emptyStateText}>You've added no artworks.</p>
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
                    {state.context.gallery.artworks.map(artwork => (
                      <li
                        key={`${artwork.artwork.id}-${artwork.frame?.id}`}
                        className={styles.collectionRow}>
                        <div className={styles.collectionRowPreview}>
                          <Artwork item={artwork} disabled />
                        </div>

                        <div className={styles.collectionRowMeta}>
                          <p>{artwork.artwork.title}</p>
                          <p>{artwork.artwork.artist?.name ?? 'Unknown'}</p>
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
                <Button type="button" onClick={() => onBack()}>
                  Back
                </Button>
                <Button type="submit" filled busy={isSubmitting}>
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
