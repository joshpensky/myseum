import { Fragment, useState } from 'react';
import axios from 'axios';
import cx from 'classnames';
import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import Button from '@src/components/Button';
import IconButton from '@src/components/IconButton';
import { Preview3d } from '@src/components/Preview3d';
import { CreateArtworkDto } from '@src/data/repositories/artwork.repository';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import rootStyles from '@src/features/create-artwork-OLD/root.module.scss';
import type {
  CreateArtworkState,
  EditDetailsEvent,
  EditDimensionsEvent,
  EditFramingEvent,
  EditSelectionEvent,
} from '@src/features/create-artwork-OLD/state';
import { AuthUserDto } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import styles from './reviewStep.module.scss';

interface ReviewStepProps {
  user: AuthUserDto;
  state: CreateArtworkState<'review'>;
  onEdit(
    event: EditDimensionsEvent | EditSelectionEvent | EditFramingEvent | EditDetailsEvent,
  ): void;
  onSubmit(data: ArtworkDto): void;
}

export const ReviewStep = ({ user, state, onEdit, onSubmit }: ReviewStepProps) => {
  const initialValues = {};

  return (
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
              depth: state.context.framing.depth ?? 0,
            },
            unit: state.context.dimensions.unit,
            createdAt: state.context.details.createdAt,
            acquiredAt: state.context.details.acquiredAt,
          };

          const res = await axios.post<ArtworkDto>('/api/artworks', createArtworkData);
          onSubmit(res.data);
        } catch (error) {
          console.error(error);
        }
      }}>
      {formik => {
        const { isSubmitting, isValid } = formik;

        const [rotated, setRotated] = useState(false);

        return (
          <Form className={rootStyles.form} noValidate>
            <div className={cx(rootStyles.activeContent, styles.activeContent)}>
              <div className={styles.preview}>
                <Preview3d
                  rotated={rotated}
                  artwork={{
                    src: state.context.selection.preview.src,
                    alt: state.context.details.altText,
                    size: {
                      width: state.context.dimensions.width,
                      height: state.context.dimensions.height,
                      depth: state.context.framing.depth ?? 0,
                    },
                  }}
                />
              </div>

              <Button type="button" onClick={() => setRotated(!rotated)}>
                Rotate
              </Button>
            </div>

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
                <h4>Framing</h4>

                <IconButton
                  className={styles.sectionEdit}
                  title="Edit Framing"
                  onClick={() => onEdit({ type: 'EDIT_FRAMING' })}>
                  <EditIcon />
                </IconButton>
              </header>

              <dl>
                <dt>Option</dt>
                <dd>{state.context.framing.hasFrame ? 'Framed' : 'No Frame'}</dd>

                {state.context.framing.hasFrame ? (
                  <Fragment>
                    <dt>Frame</dt>
                    <dd>{state.context.framing.frame.name}</dd>
                  </Fragment>
                ) : (
                  <Fragment>
                    <dt>Depth</dt>
                    <dd>
                      {state.context.framing.depth} {state.context.dimensions.unit}
                    </dd>
                  </Fragment>
                )}
              </dl>
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

            <div className={rootStyles.formActions}>
              <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                Save
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
