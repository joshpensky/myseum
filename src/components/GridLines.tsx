import tw, { css } from 'twin.macro';
import { useGrid } from '@src/providers/GridProvider';
import { useTheme } from '@src/providers/ThemeProvider';

const GridLines = () => {
  const { columns, itemSize } = useGrid();
  const theme = useTheme();

  const themeColor =
    theme &&
    {
      mint: tw`text-mint-700`,
      pink: tw`text-mint-700`, // TODO: update
      navy: tw`text-navy-800`,
      paper: tw`text-mint-700`, // TODO: update
    }[theme.color];

  return (
    <div
      css={[
        themeColor,
        tw`opacity-20 h-full relative ring-1 ring-current ring-inset pointer-events-none`,
        css`
          background-image: repeating-linear-gradient(currentColor 0 1px, transparent 1px 100%),
            repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 100%);
          background-size: ${itemSize}px ${itemSize}px;
          width: calc(${itemSize}px * ${columns});
        `,
      ]}
    />
  );
};

export default GridLines;
