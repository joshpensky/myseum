import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import api from '@src/api';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import IconButton from '@src/components/IconButton';
import { CreateArtworkDto } from '@src/data/repositories/artwork.repository';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import {
  CreateArtworkState,
  EditDetailsEvent,
  EditDimensionsEvent,
  EditSelectionEvent,
} from '@src/features/artwork/CreateArtworkModal/state';
import { AuthUserDto } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import styles from './reviewScreen.module.scss';

interface ReviewScreenProps {
  user: AuthUserDto;
  state: CreateArtworkState<'review'>;
  onEdit(event: EditDimensionsEvent | EditSelectionEvent | EditDetailsEvent): void;
  onSubmit(data: ArtworkDto): void;
}

export const ReviewScreen = ({ user, state, onEdit, onSubmit }: ReviewScreenProps) => {
  const initialValues = {};

  return (
    <FormModal.Screen title="Review" description="Make any last edits and confirm your selections.">
      <Formik
        initialValues={initialValues}
        onSubmit={async () => {
          try {
            const createArtworkData: CreateArtworkDto = {
              ownerId: user.id,
              title: state.context.details.title,
              description: state.context.details.description,
              src: state.context.selection.preview.src,
              alt: state.context.details.altText,
              size: {
                width: state.context.dimensions.width,
                height: state.context.dimensions.height,
                depth: state.context.dimensions.depth ?? 0,
              },
              unit: state.context.dimensions.unit,
              createdAt: state.context.details.createdAt,
              acquiredAt: state.context.details.acquiredAt,
            };

            const artwork = await api.artwork.create(createArtworkData);
            onSubmit(artwork);
          } catch (error) {
            console.error(error);
          }
        }}>
        {formik => {
          const { isSubmitting, isValid } = formik;

          return (
            <Form className={styles.form} noValidate>
              <FormModal.Sidecar>
                <div className={styles.preview}>
                  <img
                    src={state.context.selection.preview.src}
                    alt={state.context.details.altText}
                  />
                </div>
              </FormModal.Sidecar>

              <div className={styles.formBody}>
                <section className={styles.section}>
                  <header className={styles.sectionHeader}>
                    <h4>Dimensions</h4>

                    <IconButton
                      className={styles.sectionEdit}
                      title="Edit Dimensions"
                      onClick={() => onEdit({ type: 'EDIT_DIMENSIONS' })}>
                      <EditIcon />
                    </IconButton>
                  </header>

                  <dl>
                    <dt className="sr-only">Size</dt>
                    <dd>
                      {state.context.dimensions.width} x {state.context.dimensions.height}{' '}
                      {state.context.dimensions.unit}
                    </dd>
                  </dl>
                </section>

                <section className={styles.section}>
                  <header className={styles.sectionHeader}>
                    <h4>Selection</h4>

                    <IconButton
                      className={styles.sectionEdit}
                      title="Edit Selection"
                      onClick={() => onEdit({ type: 'EDIT_SELECTION' })}>
                      <EditIcon />
                    </IconButton>
                  </header>
                </section>

                <section className={styles.section}>
                  <header className={styles.sectionHeader}>
                    <h4>Details</h4>

                    <IconButton
                      className={styles.sectionEdit}
                      title="Edit Details"
                      onClick={() => onEdit({ type: 'EDIT_DETAILS' })}>
                      <EditIcon />
                    </IconButton>
                  </header>

                  <dl>
                    <dt>Title</dt>
                    <dd>{state.context.details.title}</dd>

                    <dt>Artist</dt>
                    <dd>{state.context.details.artist?.name ?? 'Unknown'}</dd>

                    <dt>Description</dt>
                    <dd>{state.context.details.description}</dd>

                    <dt>Created</dt>
                    <dd>
                      {state.context.details.createdAt
                        ? dayjs(state.context.details.createdAt).format('MMM D, YYYY')
                        : 'Unknown'}
                    </dd>

                    <dt>Acquired</dt>
                    <dd>{dayjs(state.context.details.acquiredAt).format('MMM D, YYYY')}</dd>
                  </dl>
                </section>
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
