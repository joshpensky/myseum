import { useState } from 'react';
import { Form, Formik } from 'formik';
import * as fx from 'glfx-es6';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import {
  ConfirmSelectionEvent,
  CreateFrameState,
} from '@src/features/frame/CreateFrameModal/state';
import { SelectionEditorSnapshot, SelectionEditorState } from '@src/features/selection';
import ImageSelectionEditor from '@src/features/selection/ImageSelectionEditor';
import ImageSelectionPreview from '@src/features/selection/ImageSelectionPreview';
import { renderPreview } from '@src/features/selection/renderPreview';
import { LayerIcon } from '@src/svgs/icons/LayerIcon';
import { Dimensions } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import styles from './selectionScreen.module.scss';

interface SelectionScreenProps {
  state: CreateFrameState<'selection'>;
  onBack(): void;
  onSubmit(data: ConfirmSelectionEvent): void;
}

export const SelectionScreen = ({ state, onBack, onSubmit }: SelectionScreenProps) => {
  const [editor, setEditor] = useState(() => {
    let initialSnapshot: SelectionEditorSnapshot | undefined = undefined;
    if (state.context.selection) {
      initialSnapshot = state.context.selection.snapshot;
    }
    return SelectionEditorState.create(initialSnapshot);
  });

  // TODO: mobile version of editor

  return (
    <FormModal.Screen
      title="Selection"
      description="Drag the handles to outline and window of the frame.">
      <Formik
        initialValues={{}}
        onSubmit={() => {
          // Create a destination canvas to render the preview to
          const destCanvas = document.createElement('canvas');
          // Resize the canvas to the highest quality within the image dimensions
          const image = state.context.upload.image;
          const maxDimensions = CanvasUtils.objectContain(
            { width: 2000, height: 2000 },
            CommonUtils.getImageDimensions(image),
          );
          const destCanvasDimensions = CanvasUtils.objectContain(
            maxDimensions,
            state.context.dimensions,
          );
          const destImageDimensions: Dimensions = {
            width: destCanvasDimensions.width / CanvasUtils.devicePixelRatio,
            height: destCanvasDimensions.height / CanvasUtils.devicePixelRatio,
          };
          CanvasUtils.resize(destCanvas, destImageDimensions);

          // Render the preview onto the destination canvas
          const webglCanvas = fx.canvas();
          const texture = webglCanvas.texture(image);
          renderPreview({
            destCanvas,
            webglCanvas,
            texture,
            image,
            paths: editor.current,
            dimensions: destImageDimensions,
            position: { x: 0, y: 0 },
          });
          texture.destroy();

          // Generate the image src from the canvas contents
          // Save as PNG for transparency!
          const previewSrc = destCanvas.toDataURL('image/png');

          onSubmit({
            type: 'CONFIRM_SELECTION',
            selection: {
              snapshot: editor.current,
              preview: previewSrc,
            },
          });
        }}>
        {formik => {
          const { isSubmitting, isValid } = formik;

          const [activeLayer, setActiveLayer] = useState<0 | 1>(0);

          return (
            <Form className={styles.form} noValidate>
              <fieldset>
                <legend className={styles.previewLabel}>Layers</legend>
                <div className={styles.layers}>
                  <button
                    className={styles.layerButton}
                    type="button"
                    aria-pressed={activeLayer === 0}
                    onClick={() => setActiveLayer(0)}>
                    <span className={styles.layerButtonIcon}>
                      <LayerIcon as="outline" />
                    </span>
                    <span className={styles.layerButtonText}>Frame</span>
                  </button>
                  <button
                    className={styles.layerButton}
                    type="button"
                    aria-pressed={activeLayer === 1}
                    onClick={() => {
                      if (!editor.current.inner) {
                        setEditor(SelectionEditorState.commit(editor, { type: 'ADD_INNER_PATH' }));
                      }
                      setActiveLayer(1);
                    }}>
                    <span className={styles.layerButtonIcon}>
                      <LayerIcon as="inner" />
                    </span>
                    <span className={styles.layerButtonText}>Window</span>
                  </button>
                </div>
              </fieldset>

              <FormModal.Sidecar className={styles.sidecar}>
                <div className={styles.editor}>
                  <ImageSelectionEditor
                    activeLayer={activeLayer}
                    editor={editor}
                    onChange={setEditor}
                    image={state.context.upload.image}
                  />
                </div>
              </FormModal.Sidecar>

              <h4 className={styles.previewLabel}>Preview</h4>
              <div className={styles.preview}>
                <ImageSelectionPreview
                  editor={editor}
                  actualDimensions={{
                    width: state.context.dimensions.width,
                    height: state.context.dimensions.height,
                  }}
                  image={state.context.upload.image}
                />
              </div>

              <FormModal.Footer>
                <Button type="button" onClick={onBack}>
                  Back
                </Button>

                <Button
                  type="submit"
                  filled
                  busy={isSubmitting}
                  disabled={!isValid || !editor.current.inner}>
                  Next
                </Button>
              </FormModal.Footer>
            </Form>
          );
        }}
      </Formik>
    </FormModal.Screen>
  );
};
