import tw, { css } from 'twin.macro';
import Artwork from '@src/components/Artwork';
import { useGrid } from '@src/providers/GridProvider';
import { Artwork as ArtworkData, Position } from '@src/types';

export type GridItemProps = {
  item: ArtworkData;
  position: Position;
};

const GridItem = ({ item, position }: GridItemProps) => {
  const { itemSize } = useGrid();

  const { dimensions } = item.frame;
  const { width: frameWidth, height: frameHeight } = dimensions;

  return (
    <div
      css={[
        tw`absolute top-0 bottom-0 flex items-center justify-center`,
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
        <Artwork data={item} withShadow />
      </div>
    </div>
  );
};

export default GridItem;
