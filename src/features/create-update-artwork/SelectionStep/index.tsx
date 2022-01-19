import { FormEvent, useState } from 'react';
import * as fx from 'glfx-es6';
import Button from '@src/components/Button';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import styles from '@src/features/create-update-artwork/root.module.scss';
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
  const [editor, setEditor] = useState(() => {
    let initialSnapshot: SelectionEditorSnapshot | undefined = undefined;
    if (state.context.selection) {
      initialSnapshot = {
        outline: state.context.selection.path,
      };
    }
    return SelectionEditorState.create(initialSnapshot);
  });

  const onFormSubmit = (evt: FormEvent) => {
    evt.preventDefault();

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
    const previewSrc = destCanvas.toDataURL();
    const preview = document.createElement('img');
    preview.src = previewSrc;

    onSubmit({
      type: 'CONFIRM_SELECTION',
      selection: {
        path: editor.current.outline,
        preview,
      },
    });
  };

  return (
    <form className={styles.form} onSubmit={onFormSubmit}>
      <div className={styles.activeContent}>
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

      <div className={styles.formActions}>
        <Button size="large" type="button" onClick={onBack}>
          Back
        </Button>

        <Button size="large" type="submit" filled>
          Next
        </Button>
      </div>
    </form>
  );
};
