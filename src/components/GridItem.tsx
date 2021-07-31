import tw, { css } from 'twin.macro';
import { Artwork, ArtworkProps } from '@src/components/Artwork';
import { useGrid } from '@src/providers/GridProvider';
import { Position } from '@src/types';

export type GridItemProps = {
  item: ArtworkProps['data'];
  position: Position;
};

const GridItem = ({ item, position }: GridItemProps) => {
  const gridCtx = useGrid();
  if (!gridCtx) {
    throw new Error('Cannot use GridItem outside of GridProvider context');
  }
  const { itemSize } = gridCtx;

  const frameWidth = item.frame?.width ?? item.width;
  const frameHeight = item.frame?.height ?? item.height;

  return (
    <div
      css={[
        tw`absolute inset-y-0 flex items-center justify-center pointer-events-auto`,
        // tw`bg-red-400 bg-opacity-30`, // <- DEBUG
        css`
          height: ${Math.ceil(frameHeight) * itemSize}px;
          width: ${Math.ceil(frameWidth) * itemSize}px;
          transform: translate(${position.x * itemSize}px, ${position.y * itemSize}px);
        `,
      ]}>
      <div
        css={[
          tw`flex items-start`,
          css`
            height: ${frameHeight * itemSize}px;
          `,
        ]}>
        <Artwork data={item} disabled />
      </div>
    </div>
  );
};

export default GridItem;
