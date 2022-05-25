import { GalleryColor } from '@prisma/client';
import cx from 'classnames';
import * as FormModal from '@src/components/FormModal';
import {
  ChangeWidthEvent,
  CreateGalleryTypestate,
  MoveArtworkEvent,
} from '@src/features/gallery/CreateGalleryModal/state';
import { EditGalleryTypestate } from '@src/features/gallery/EditGalleryModal/state';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import * as Grid from '@src/features/grid';
import styles from './gridSidecar.module.scss';

interface GridSidecarProps<S extends CreateGalleryTypestate | EditGalleryTypestate> {
  color: GalleryColor;
  height: number;
  state: S;
  isEditing?: boolean;
  send: (event: ChangeWidthEvent | MoveArtworkEvent) => void;
}

export function GridSidecar<S extends CreateGalleryTypestate | EditGalleryTypestate>({
  color,
  height,
  state,
  send,
  isEditing,
}: GridSidecarProps<S>) {
  return (
    <Grid.Root
      size={{ width: state.context.width, height: height }}
      items={state.context.gallery?.artworks ?? []}
      step={1}
      getItemId={item => item.id}
      renderItem={(item, props) => (
        <GridArtwork {...props} item={item} isEditing={isEditing} disabled={props.disabled} />
      )}
      onSizeChange={size => {
        send({ type: 'CHANGE_WIDTH', width: size.width });
      }}
      onItemChange={(index, data) => {
        send({ type: 'MOVE_ARTWORK', index, data });
      }}>
      <FormModal.Sidecar className={cx(styles.gridBlock, `theme--${color}`)}>
        <div className={styles.gridBlockGridWrapper}>
          <Grid.Grid className={styles.gridBlockGrid} />
        </div>
        <div className={styles.gridBlockMap}>
          <Grid.Map />
        </div>
      </FormModal.Sidecar>
    </Grid.Root>
  );
}
