import { forwardRef, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import * as Grid from '@src/features/grid';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import styles from './collectionScreen.module.scss';
import { CreateGalleryState } from '../state';

const BP_DRAWER = Number.parseInt(styles.varBpDrawer, 10);

interface CollectionScreenProps {
  state: CreateGalleryState<'collection'>;
  onBack(): void;
  onSubmit(data: GalleryDto): void;
}

export const CollectionScreen = forwardRef<FormikProps<any>, CollectionScreenProps>(
  function CollectionScreen({ state, onBack, onSubmit }, ref) {
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
              <Form noValidate>
                <FormModal.Root
                  open={openGridModal}
                  onOpenChange={setOpenGridModal}
                  title="Place Artworks"
                  trigger={<Button type="button">Open grid</Button>}>
                  <Grid.Root
                    size={{ width: 0, height: state.context.gallery.height }}
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

                <Button type="button" onClick={() => onBack()}>
                  Back
                </Button>
                <Button filled busy={isSubmitting}>
                  Save
                </Button>
              </Form>
            );
          }}
        </Formik>
      </FormModal.Screen>
    );
  },
);
