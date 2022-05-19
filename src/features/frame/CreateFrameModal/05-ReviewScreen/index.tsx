import { Form, Formik } from 'formik';
import * as fx from 'glfx-es6';
import PerspT from 'perspective-transform';
import api from '@src/api';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { ReviewSection } from '@src/components/ReviewSection';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import {
  CreateFrameState,
  EditDetailsEvent,
  EditDimensionsEvent,
  EditSelectionEvent,
} from '@src/features/frame/CreateFrameModal/state';
import { SelectionEditorPath, SelectionEditorState } from '@src/features/selection';
import { DetailsIcon } from '@src/svgs/DetailsIcon';
import { DimensionsIcon } from '@src/svgs/DimensionsIcon';
import { SelectionIcon } from '@src/svgs/SelectionIcon';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import styles from './reviewScreen.module.scss';

interface ReviewScreenProps {
  state: CreateFrameState<'review'>;
  onEdit(event: EditDimensionsEvent | EditSelectionEvent | EditDetailsEvent): void;
  onSubmit(data: FrameDto): void;
}

export const ReviewScreen = ({ state, onEdit, onSubmit }: ReviewScreenProps) => {
  const initialValues = {};

  return (
    <FormModal.Screen title="Review" description="Make any last edits and confirm your selections.">
      <Formik
        initialValues={initialValues}
        onSubmit={async () => {
          const srcPoints = GeometryUtils.sortConvexQuadrilateralPoints(
            state.context.selection.snapshot.outline,
          );
          const canvasSrcMatrix = srcPoints.flatMap(c => [c.x, c.y]) as fx.Matrix;
          const canvasDestMatrix: fx.Matrix = [0, 0, 1, 0, 1, 1, 0, 1];
          const perspective = PerspT(canvasSrcMatrix, canvasDestMatrix);
          let window: SelectionEditorPath;
          if (state.context.selection.snapshot.inner) {
            // Transform point from source matrix to projected position on destination matrix
            window = state.context.selection.snapshot.inner.map(point => {
              const [x, y] = perspective.transform(point.x, point.y);
              return { x, y };
            }) as SelectionEditorPath;
          } else {
            window = SelectionEditorState.DEFAULT_INITIAL_SNAPSHOT.outline;
          }

          try {
            const frame = await api.frame.create({
              name: state.context.details.name,
              src: state.context.selection.preview,
              alt: state.context.details.altText,
              size: {
                width: state.context.dimensions.width,
                height: state.context.dimensions.height,
                depth: state.context.dimensions.depth ?? 0,
              },
              unit: state.context.dimensions.unit,
              window,
            });
            onSubmit(frame);
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
                  <img src={state.context.selection.preview} alt={state.context.details.altText} />
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
                    <dt>Name</dt>
                    <dd>{state.context.details.name}</dd>
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
