import { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import * as fx from 'glfx-es6';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import {
  ConfirmSelectionEvent,
  EditArtworkState,
} from '@src/features/artwork/EditArtworkModal/state';
import { SelectionEditorSnapshot, SelectionEditorState } from '@src/features/selection';
import ImageSelectionEditor from '@src/features/selection/ImageSelectionEditor';
import ImageSelectionPreview from '@src/features/selection/ImageSelectionPreview';
import { renderPreview } from '@src/features/selection/renderPreview';
import { Dimensions } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import { getImageUrl } from '@src/utils/getImageUrl';
import styles from './selectionScreen.module.scss';

interface SelectionScreenProps {
  state: EditArtworkState<'selection'>;
  onBack(): void;
  onSubmit(data: ConfirmSelectionEvent): void;
}

export const SelectionScreen = ({ state, onBack, onSubmit }: SelectionScreenProps) => {
  const [editor, setEditor] = useState(() => {
    let initialSnapshot: SelectionEditorSnapshot | undefined = undefined;
    if (state.context.selection) {
      initialSnapshot = {
        outline: state.context.selection.path,
      };
    }
    return SelectionEditorState.create(initialSnapshot);
  });

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImage(image);
    };
    image.crossOrigin = 'anonymous';
    image.src = state.context.selection.preview.includes('base64')
      ? state.context.selection.preview
      : getImageUrl('artworks', state.context.selection.preview);
  }, []);

  // TODO: mobile version of editor

  return (
    <FormModal.Screen title="Selection" description="Drag the handles to outline the artwork.">
      <Formik
        initialValues={{}}
        onSubmit={() => {
          if (!image) {
            return;
          }

          let previewSrc: string;
          if (
            SelectionEditorState.matches(
              editor.current.outline,
              SelectionEditorState.DEFAULT_INITIAL_SNAPSHOT.outline,
            )
          ) {
            previewSrc = state.context.selection.preview;
          } else {
            // Create a destination canvas to render the preview to
            const destCanvas = document.createElement('canvas');
            // Resize the canvas to the highest quality within the image dimensions
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
            previewSrc = destCanvas.toDataURL('image/jpeg');
          }

          onSubmit({
            type: 'CONFIRM_SELECTION',
            selection: {
              path: editor.current.outline,
              preview: previewSrc,
            },
          });
        }}>
        {formik => {
          const { isSubmitting, isValid } = formik;

          return (
            <Form className={styles.form} noValidate>
              {image && (
                <FormModal.Sidecar className={styles.sidecar}>
                  <div className={styles.editor}>
                    <ImageSelectionEditor
                      activeLayer={0}
                      editor={editor}
                      onChange={setEditor}
                      image={image}
                    />
                  </div>
                </FormModal.Sidecar>
              )}

              <h4 className={styles.previewLabel}>Preview</h4>
              <div className={styles.preview}>
                {image && (
                  <ImageSelectionPreview
                    editor={editor}
                    actualDimensions={{
                      width: state.context.dimensions.width,
                      height: state.context.dimensions.height,
                    }}
                    image={image}
                  />
                )}
              </div>

              <FormModal.Footer>
                <Button type="button" onClick={onBack}>
                  Back
                </Button>

                <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
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
