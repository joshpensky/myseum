import { Children, ReactElement } from 'react';
import tw, { css } from 'twin.macro';
import { GridItemProps } from '@src/components/GridItem';
import { useGrid } from '@src/providers/GridProvider';
import { useTheme } from '@src/providers/ThemeProvider';

export type GridMapProps = {
  children: ReactElement<GridItemProps>[]; // force only GridItem children
};

const GridMap = ({ children }: GridMapProps) => {
  const { columns, rows, percentScrolled, percentVisible } = useGrid();
  const theme = useTheme();

  const scrollbar = (
    <rect
      css={tw`fill-current`}
      transform={`translate(${percentScrolled * columns} 0)`}
      x={0}
      y={0}
      width={percentVisible * columns}
      height={rows}
    />
  );

  const gridItems = Children.map(children, ({ props: { item, position } }) => (
    <rect
      css={tw`fill-current`}
      x={position.x}
      y={position.y}
      width={item.frame.dimensions.width}
      height={item.frame.dimensions.height}
    />
  ));

  return (
    <div
      className="group"
      css={[
        theme &&
          {
            mint: tw`text-mint-400`,
            pink: tw`text-mint-400`, // TODO
            navy: tw`text-navy-800`,
            paper: tw`text-mint-400`, // TODO
          }[theme.color],
        tw`relative border border-current rounded-md h-6 mx-auto overflow-hidden max-w-2xl`,
        css`
          width: ${columns * 0.125}rem;
        `,
      ]}>
      <span css={[tw`absolute top-0 left-0 h-full w-full`]}>
        <svg
          css={tw`block opacity-60 h-full w-full`}
          viewBox={[0, 0, columns, rows].join(' ')}
          preserveAspectRatio="none">
          <defs>
            <mask id="scroller-mask" css={tw`text-black`}>
              <rect fill="white" x={0} y={0} width={columns} height={rows} />
              {scrollbar}
            </mask>
            <mask id="grid-mask" css={tw`text-black`}>
              <rect fill="white" x={0} y={0} width={columns} height={rows} />
              {gridItems}
            </mask>
          </defs>
          <g mask="url(#scroller-mask)">{gridItems}</g>
          <g mask="url(#grid-mask)">{scrollbar}</g>
        </svg>
      </span>
    </div>
  );
};

export default GridMap;
