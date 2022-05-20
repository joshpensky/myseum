import { Fragment, PropsWithChildren, useState } from 'react';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import api from '@src/api';
import { AlertDialog } from '@src/components/AlertDialog';
import { Artwork } from '@src/components/Artwork';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { ReviewSection } from '@src/components/ReviewSection';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import {
  EditGalleryState,
  EditDetailsEvent,
  EditCollectionEvent,
} from '@src/features/gallery/EditGalleryModal/state';
import { CollectionIcon } from '@src/svgs/icons/CollectionIcon';
import { DetailsIcon } from '@src/svgs/icons/DetailsIcon';
import styles from './reviewScreen.module.scss';

interface ReviewScreenProps {
  state: EditGalleryState<'review'>;
  onEdit(event: EditDetailsEvent | EditCollectionEvent): void;
  onSubmit(data: GalleryDto): void;
  onDelete(): void;
}

export const ReviewScreen = ({
  children,
  state,
  onDelete,
  onEdit,
  onSubmit,
}: PropsWithChildren<ReviewScreenProps>) => {
  const [hasDeleteIntent, setHasDeleteIntent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const initialValues = {};

  return (
    <FormModal.Screen title="Edit Gallery" description="Choose an area to update.">
      <Formik
        initialValues={initialValues}
        onSubmit={() => {
          // Nothing to save to API — just submit!
          onSubmit(state.context.gallery);
        }}>
        {formik => {
          const { isSubmitting, isValid } = formik;

          return (
            <Form className={styles.form} noValidate>
              {children}

              <div className={styles.formBody}>
                <ReviewSection
                  icon={DetailsIcon}
                  title="Details"
                  onEdit={() => onEdit({ type: 'EDIT_DETAILS' })}>
                  <dl>
                    <dt>Name</dt>
                    <dd>{state.context.gallery.name}</dd>

                    {state.context.gallery.description && (
                      <Fragment>
                        <dt>Description</dt>
                        <dd>{state.context.gallery.description}</dd>
                      </Fragment>
                    )}

                    <dt>Wall Color</dt>
                    {/* TODO: style color */}
                    <dd>{state.context.gallery.color}</dd>

                    <dt>Height</dt>
                    <dd>{state.context.gallery.height} in</dd>
                  </dl>
                </ReviewSection>

                <ReviewSection
                  icon={CollectionIcon}
                  title="Collection"
                  onEdit={() => onEdit({ type: 'EDIT_COLLECTION' })}>
                  <ul className={styles.artworkGrid}>
                    {state.context.gallery.artworks.map(item => (
                      <li key={item.id} className={styles.artwork}>
                        <Artwork item={item} disabled />
                      </li>
                    ))}
                  </ul>
                  {/* TODO: render collection */}
                </ReviewSection>

                <AlertDialog
                  open={hasDeleteIntent}
                  onOpenChange={setHasDeleteIntent}
                  busy={isDeleting}
                  title="Confirm Gallery Deletion"
                  description={`Are you sure you want to delete "${state.context.gallery.name}"?`}
                  hint="You cannot undo this action."
                  action={
                    <Button
                      danger
                      filled
                      busy={isDeleting}
                      onClick={async () => {
                        try {
                          setIsDeleting(true);
                          await api.gallery.delete(
                            state.context.gallery.museum.id,
                            state.context.gallery.id,
                          );
                          setHasDeleteIntent(false);
                          onDelete();
                        } catch (error) {
                          toast.error((error as Error).message);
                          setIsDeleting(false);
                        }
                      }}>
                      Delete
                    </Button>
                  }
                  trigger={
                    <Button className={styles.dangerZoneAction} type="button" danger>
                      Delete gallery
                    </Button>
                  }
                />
              </div>

              <FormModal.Footer>
                <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                  Save
                </Button>
              </FormModal.Footer>
            </Form>
          );
        }}
      </Formik>
    </FormModal.Screen>
  );
};
