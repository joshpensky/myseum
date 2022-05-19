import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { ReviewSection } from '@src/components/ReviewSection';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import {
  EditArtworkState,
  EditDetailsEvent,
  EditDimensionsEvent,
  EditSelectionEvent,
} from '@src/features/artwork/EditArtworkModal/state';
import { DetailsIcon } from '@src/svgs/DetailsIcon';
import { DimensionsIcon } from '@src/svgs/DimensionsIcon';
import { SelectionIcon } from '@src/svgs/SelectionIcon';
import styles from './reviewScreen.module.scss';

interface ReviewScreenProps {
  state: EditArtworkState<'review'>;
  onEdit(event: EditDimensionsEvent | EditSelectionEvent | EditDetailsEvent): void;
  onSubmit(data: ArtworkDto): void;
}

export const ReviewScreen = ({ state, onEdit, onSubmit }: ReviewScreenProps) => {
  const initialValues = {};

  return (
    <FormModal.Screen title="Edit Artwork" description="Choose an area to edit">
      <Formik
        initialValues={initialValues}
        onSubmit={() => {
          // TODO: on submit
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
                <ReviewSection
                  icon={DimensionsIcon}
                  title="Dimensions"
                  onEdit={() => onEdit({ type: 'EDIT_DIMENSIONS' })}>
                  <dl className="row">
                    <div>
                      <dt>Width</dt>
                      <dd>
                        {state.context.dimensions.width} {state.context.dimensions.unit}
                      </dd>
                    </div>

                    <div>
                      <dt>Height</dt>
                      <dd>
                        {state.context.dimensions.height} {state.context.dimensions.unit}
                      </dd>
                    </div>

                    <div>
                      <dt>Depth</dt>
                      <dd>
                        {state.context.dimensions.depth} {state.context.dimensions.unit}
                      </dd>
                    </div>
                  </dl>
                </ReviewSection>

                <ReviewSection
                  icon={SelectionIcon}
                  title="Selection"
                  onEdit={() => onEdit({ type: 'EDIT_SELECTION' })}
                />

                <ReviewSection
                  icon={DetailsIcon}
                  title="Details"
                  onEdit={() => onEdit({ type: 'EDIT_DETAILS' })}>
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
                </ReviewSection>
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
