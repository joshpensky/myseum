import { forwardRef, PropsWithChildren, useState } from 'react';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import IconButton from '@src/components/IconButton';
import { SearchBar } from '@src/components/SearchBar';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import * as Grid from '@src/features/grid';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { EditIcon } from '@src/svgs/EditIcon';
import { PlusIcon } from '@src/svgs/PlusIcon';
import styles from './collectionScreen.module.scss';
import { CreateGalleryModalContext } from '..';
import { CreateGalleryState } from '../state';

const BP_DRAWER = Number.parseInt(styles.varBpDrawer, 10);

interface CollectionScreenProps {
  state: CreateGalleryState<'collection'>;
  onBack(): void;
  onSubmit(data: GalleryDto): void;
}

export const CollectionScreen = forwardRef<
  FormikProps<any>,
  PropsWithChildren<CollectionScreenProps>
>(function CollectionScreen({ children, state, onBack, onSubmit }, ref) {
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
    <FormModal.Screen title="Collection" description="Add details about your gallery.">
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
              <FormModal.Root
                open={openGridModal}
                onOpenChange={setOpenGridModal}
                title="Place Artworks"
                trigger={
                  <div className={cx(styles.gridPreview, `theme--${state.context.gallery.color}`)}>
                    <Grid.Root
                      preview
                      size={{ width: 10, height: state.context.gallery.height }}
                      items={[] as PlacedArtworkDto[]}
                      step={1}
                      getItemId={item => String(item.artwork.id)}
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
                  items={[] as PlacedArtworkDto[]}
                  step={1}
                  getItemId={item => String(item.artwork.id)}
                  renderItem={(item, props) => (
                    <GridArtwork {...props} item={item} disabled={props.disabled} />
                  )}>
                  <Grid.Grid />
                  <Grid.Map />
                </Grid.Root>
              </FormModal.Root>

              <div className={styles.search}>
                <SearchBar name="search" label="Search collection" />
                <Button className={styles.searchAction} icon={PlusIcon}>
                  Add
                </Button>
              </div>

              <CreateGalleryModalContext.Provider
                value={{
                  height: state.context.gallery.height,
                  color: state.context.gallery.color,
                }}>
                {children}
              </CreateGalleryModalContext.Provider>

              <div className={styles.actions}>
                <Button type="button" onClick={() => onBack()}>
                  Back
                </Button>
                <Button filled busy={isSubmitting}>
                  Save
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </FormModal.Screen>
  );
});
