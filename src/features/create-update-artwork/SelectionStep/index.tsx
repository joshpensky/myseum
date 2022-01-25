import { useState } from 'react';
import { Form, Formik } from 'formik';
import * as fx from 'glfx-es6';
import Button from '@src/components/Button';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import rootStyles from '@src/features/create-update-artwork/root.module.scss';
import type {
  ConfirmSelectionEvent,
  CreateUpdateArtworkState,
} from '@src/features/create-update-artwork/state';
import { SelectionEditorSnapshot, SelectionEditorState } from '@src/features/selection';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import { renderPreview } from '@src/utils/renderPreview';

interface SelectionStepProps {
  state: CreateUpdateArtworkState<'selection'>;
  onBack(): void;
  onSubmit(data: ConfirmSelectionEvent): void;
}

export const SelectionStep = ({ state, onBack, onSubmit }: SelectionStepProps) => {
  // TODO: store editor in context to keep history?
  const [editor, setEditor] = useState(() => {
    let initialSnapshot: SelectionEditorSnapshot | undefined = undefined;
    if (state.context.selection) {
      initialSnapshot = {
        outline: state.context.selection.path,
      };
    }
    return SelectionEditorState.create(initialSnapshot);
  });

  return (
    <Formik
      initialValues={{}}
      onSubmit={() => {
        // TODO: if selection context already exists, do path equivalency check to see
        // if we need to recreate preview

        // TODO: if path is initial path (00,01,11,10), just reuse the uploaded image

        // Create a destination canvas to render the preview to
        const destCanvas = document.createElement('canvas');
        // Resize the canvas to the highest quality within the image dimensions
        const image = state.context.upload.image;
        const destCanvasDimensions = CanvasUtils.objectContain(
          CommonUtils.getImageDimensions(image),
          state.context.dimensions,
        );
        CanvasUtils.resize(destCanvas, destCanvasDimensions);

        // Render the preview onto the destination canvas
        const webglCanvas = fx.canvas();
        const texture = webglCanvas.texture(image);
        renderPreview({
          destCanvas,
          webglCanvas,
          texture,
          image,
          paths: editor.current,
          dimensions: destCanvasDimensions,
          position: { x: 0, y: 0 },
        });
        texture.destroy();

        // Generate the image src from the canvas contents
        const previewSrc = destCanvas.toDataURL('image/png');
        const preview = document.createElement('img');
        preview.src = previewSrc;

        onSubmit({
          type: 'CONFIRM_SELECTION',
          selection: {
            path: editor.current.outline,
            preview,
          },
        });
      }}>
      {formik => {
        const { isSubmitting, isValid } = formik;

        return (
          <Form className={rootStyles.form} noValidate>
            <div className={rootStyles.activeContent}>
              <ImageSelectionEditor
                activeLayer={0}
                editor={editor}
                onChange={setEditor}
                actualDimensions={{
                  width: state.context.dimensions.width,
                  height: state.context.dimensions.height,
                }}
                image={state.context.upload.image}
              />
            </div>

            <ImageSelectionPreview
              editor={editor}
              actualDimensions={{
                width: state.context.dimensions.width,
                height: state.context.dimensions.height,
              }}
              image={state.context.upload.image}
            />

            <div className={rootStyles.formActions}>
              <Button size="large" type="button" onClick={onBack}>
                Back
              </Button>

              <Button size="large" type="submit" filled disabled={!isValid || isSubmitting}>
                Next
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
